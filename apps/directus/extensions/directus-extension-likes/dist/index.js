const ALLOWED_USER_EMAIL = 'website-reader@adechlien.blog'
const MAX_TEXT_ID_LENGTH = 128

function normalizeTextId(value) {
  const textId = String(value ?? '').trim()

  if (!textId || textId.length > MAX_TEXT_ID_LENGTH) {
    return null
  }

  return textId
}

async function isAllowedUser(database, accountability) {
  if (!accountability?.user) return false

  const user = await database('directus_users')
    .select('email', 'status')
    .where({ id: accountability.user })
    .first()

  return user?.email === ALLOWED_USER_EMAIL && user?.status === 'active'
}

export default {
  id: 'likes',
  handler: (router, { database, logger }) => {
    router.use(async (request, response, next) => {
      try {
        if (!(await isAllowedUser(database, request.accountability))) {
          return response.status(401).json({ error: 'Unauthorized' })
        }

        next()
      } catch (error) {
        next(error)
      }
    })

    router.get('/:textId', async (request, response, next) => {
      try {
        const textId = normalizeTextId(request.params.textId)

        if (!textId) {
          return response.status(400).json({ error: 'Invalid textId' })
        }

        const row = await database('text_likes')
          .select('likes')
          .where({ text_id: textId })
          .first()

        return response.json({ textId, likes: row?.likes ?? 0 })
      } catch (error) {
        logger.error(error, 'Unable to read text likes')
        next(error)
      }
    })

    router.post('/:textId', async (request, response, next) => {
      try {
        const textId = normalizeTextId(request.params.textId)
        const action = request.body?.action === 'unlike' ? 'unlike' : 'like'

        if (!textId) {
          return response.status(400).json({ error: 'Invalid textId' })
        }

        const increment = action === 'unlike' ? -1 : 1
        const result = await database.raw(
          `
            INSERT INTO text_likes (text_id, likes, date_updated)
            VALUES (?, ?, NOW())
            ON CONFLICT (text_id) DO UPDATE
            SET likes = GREATEST(text_likes.likes + ?, 0),
                date_updated = NOW()
            RETURNING likes
          `,
          [textId, Math.max(increment, 0), increment],
        )

        return response.json({
          textId,
          likes: Number(result.rows[0].likes),
        })
      } catch (error) {
        logger.error(error, 'Unable to update text likes')
        next(error)
      }
    })
  },
}
