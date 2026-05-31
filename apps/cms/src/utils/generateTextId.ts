function pad2(value: number) {
  return String(value).padStart(2, '0')
}

function randomTwoDigits() {
  return pad2(Math.floor(Math.random() * 100))
}

export function generateTextNumericId(pubDate: string | Date) {
  const date = pubDate instanceof Date ? pubDate : new Date(pubDate)

  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid pubDate for numericId generation')
  }

  const day = pad2(date.getDate())
  const month = pad2(date.getMonth() + 1)
  const year = pad2(date.getFullYear() % 100)

  return `${day}${randomTwoDigits()}${month}${randomTwoDigits()}${year}`
}
