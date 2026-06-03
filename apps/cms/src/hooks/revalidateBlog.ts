let lastDeployAt = 0

const DEPLOY_COOLDOWN_MS = 60_000

export async function revalidateBlog() {
  const deployHookUrl = process.env.VERCEL_BLOG_DEPLOY_HOOK_URL

  if (!deployHookUrl) {
    console.warn('VERCEL_BLOG_DEPLOY_HOOK_URL is not configured')
    return
  }

  const now = Date.now()

  if (now - lastDeployAt < DEPLOY_COOLDOWN_MS) {
    console.log('Skipping blog redeploy: cooldown active')
    return
  }

  lastDeployAt = now

  try {
    const response = await fetch(deployHookUrl, {
      method: 'POST',
    })

    if (!response.ok) {
      console.error(
        `Blog redeploy failed: ${response.status} ${response.statusText}`,
      )
      return
    }

    console.log('Blog redeploy triggered successfully')
  } catch (error) {
    console.error('Blog redeploy request failed:', error)
  }
}
