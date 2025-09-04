import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyTechCorp() {
  try {
    const business = await prisma.business.findFirst({
      where: { title: 'TechCorp Solutions' },
      include: {
        healthMetrics: true,
        forecastResults: true,
        owner: {
          select: { email: true, name: true },
        },
      },
    })

    if (!business) {
      console.log('❌ TechCorp Solutions not found!')
      return
    }

    console.log('✅ TechCorp Solutions verification:')
    console.log('Business ID:', business.id)
    console.log('Owner:', business.owner.name, '(' + business.owner.email + ')')
    console.log('Revenue: $' + business.revenue?.toString())
    console.log('Profit: $' + business.profit?.toString())
    console.log('Cash Flow: $' + business.cashFlow?.toString())
    console.log('EBITDA: $' + business.ebitda?.toString())
    console.log('Employees:', business.employees)
    console.log('Customer Base:', business.customerBase)
    console.log('Health metrics count:', business.healthMetrics.length)
    console.log('Forecast results count:', business.forecastResults.length)

    if (business.healthMetrics.length > 0) {
      const metric = business.healthMetrics[0]
      console.log('Overall Health Score:', metric.overallScore)
      console.log('Financial Score:', metric.financialScore)
      console.log('Growth Score:', metric.growthScore)
      console.log('Trajectory:', metric.trajectory)
    }

    console.log(
      '\n🎉 TechCorp Solutions is ready for Financial Health Dashboard testing!'
    )
  } catch (error) {
    console.error('Error verifying TechCorp:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyTechCorp()
