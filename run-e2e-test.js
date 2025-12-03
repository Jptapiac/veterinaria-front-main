const dayjs = require('dayjs')

function generateSlots(dateISO) {
  const date = dayjs(dateISO).hour(9).minute(0).second(0).millisecond(0)
  const slots = []
  for (let h = 9; h <= 18; h++) {
    const slot = date.hour(h).format('YYYY-MM-DDTHH:mm:ss.SSSZ')
    slots.push(slot)
  }
  return slots
}

async function run() {
  const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD')
  console.log('Today:', dayjs().format())
  console.log('Testing date:', tomorrow)

  const slots = generateSlots(tomorrow)
  console.log('Generated slots (first 5):')
  slots.slice(0, 5).forEach(s => console.log(' ', s))
  console.log('Last slot:', slots[slots.length - 1])

  const slot18 = slots.find(s => s.includes('T18:00'))
  if (!slot18) {
    console.error('No 18:00 slot generated')
    process.exit(1)
  }

  console.log('\nSelected slot:', slot18)
  const slotDate = dayjs(slot18)
  console.log('Slot parsed as:', slotDate.format())
  console.log('Now:', dayjs().format())

  if (slotDate.isBefore(dayjs())) {
    console.error('Slot is in the past!')
  } else {
    console.log('Slot is in the future — OK to schedule')
  }

  const appointment = {
    id: 'test-' + Math.random().toString(36).slice(2, 9),
    userId: 'user-test',
    petId: 'pet-test',
    vetId: 'vet-test',
    reason: 'Control general',
    dateTime: slot18,
    status: 'PROGRAMADA'
  }

  console.log('\nSimulated appointment created:')
  console.log(JSON.stringify(appointment, null, 2))
}

run().catch(err => { console.error(err); process.exit(1) })
