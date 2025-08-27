import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { ValuationResult } from '@/types/valuation'
import { formatCurrency } from './utils'

export class PDFExporter {
  private doc: jsPDF
  private yPosition: number = 20
  private pageHeight: number = 280
  private margin: number = 20

  constructor() {
    this.doc = new jsPDF()
  }

  async exportValuationReport(result: ValuationResult): Promise<void> {
    try {
      this.addHeader(result)
      this.addExecutiveSummary(result)
      this.addValuationMethods(result)
      this.addKeyMetrics(result)
      this.addRecommendations(result)
      this.addDisclaimer()

      // Save the PDF
      this.doc.save(`${result.companyName}_Valuation_Report.pdf`)
    } catch (error) {
      console.error('PDF export error:', error)
      throw new Error('Failed to generate PDF report')
    }
  }

  private addHeader(result: ValuationResult): void {
    // Company name and title
    this.doc.setFontSize(24)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Business Valuation Report', this.margin, this.yPosition)

    this.yPosition += 15
    this.doc.setFontSize(18)
    this.doc.text(result.companyName, this.margin, this.yPosition)

    // Date
    this.yPosition += 10
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'normal')
    const reportDate = new Date(result.evaluationDate).toLocaleDateString(
      'en-US',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }
    )
    this.doc.text(`Report Date: ${reportDate}`, this.margin, this.yPosition)

    // Add line separator
    this.yPosition += 10
    this.doc.line(this.margin, this.yPosition, 190, this.yPosition)
    this.yPosition += 15
  }

  private addExecutiveSummary(result: ValuationResult): void {
    this.checkPageBreak(40)

    this.doc.setFontSize(16)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Executive Summary', this.margin, this.yPosition)
    this.yPosition += 15

    // Overall valuation box
    this.doc.setFillColor(240, 248, 255)
    this.doc.rect(this.margin, this.yPosition - 5, 170, 25, 'F')
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(
      'Estimated Business Value:',
      this.margin + 5,
      this.yPosition + 5
    )

    this.doc.setFontSize(20)
    this.doc.setTextColor(14, 165, 233)
    this.doc.text(
      formatCurrency(result.overallValuation),
      this.margin + 5,
      this.yPosition + 15
    )

    this.doc.setTextColor(0, 0, 0)
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(
      `Confidence Score: ${result.confidenceScore.toFixed(0)}%`,
      this.margin + 100,
      this.yPosition + 15
    )

    this.yPosition += 35
  }

  private addValuationMethods(result: ValuationResult): void {
    this.checkPageBreak(60)

    this.doc.setFontSize(16)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Valuation Methods', this.margin, this.yPosition)
    this.yPosition += 15

    result.methods.forEach((method, index) => {
      this.checkPageBreak(20)

      // Method name and value
      this.doc.setFontSize(12)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(`${index + 1}. ${method.name}`, this.margin, this.yPosition)

      this.doc.setFont('helvetica', 'normal')
      this.doc.text(
        formatCurrency(method.value),
        this.margin + 100,
        this.yPosition
      )
      this.doc.text(
        `${method.confidence.toFixed(0)}% confidence`,
        this.margin + 150,
        this.yPosition
      )

      this.yPosition += 8

      // Description
      this.doc.setFontSize(10)
      this.doc.text(method.description, this.margin + 10, this.yPosition)

      this.yPosition += 12
    })
  }

  private addKeyMetrics(result: ValuationResult): void {
    this.checkPageBreak(50)

    this.doc.setFontSize(16)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Key Financial Metrics', this.margin, this.yPosition)
    this.yPosition += 15

    const metrics = [
      {
        label: 'Revenue Multiple',
        value: `${result.keyMetrics.revenueMultiple.toFixed(1)}x`,
      },
      {
        label: 'Profit Margin',
        value: `${result.keyMetrics.profitMargin.toFixed(1)}%`,
      },
      {
        label: 'Return on Assets',
        value: `${result.keyMetrics.returnOnAssets.toFixed(1)}%`,
      },
      {
        label: 'Debt-to-Equity',
        value: result.keyMetrics.debtToEquity.toFixed(2),
      },
      {
        label: 'Growth Rate',
        value: `${result.keyMetrics.growthRate.toFixed(1)}%`,
      },
    ]

    metrics.forEach(metric => {
      this.doc.setFontSize(11)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(`${metric.label}:`, this.margin, this.yPosition)
      this.doc.text(metric.value, this.margin + 80, this.yPosition)
      this.yPosition += 8
    })

    this.yPosition += 10
  }

  private addRecommendations(result: ValuationResult): void {
    if (
      result.recommendations.length === 0 &&
      result.riskFactors.length === 0
    ) {
      return
    }

    this.checkPageBreak(40)

    if (result.recommendations.length > 0) {
      this.doc.setFontSize(16)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text('Recommendations', this.margin, this.yPosition)
      this.yPosition += 15

      result.recommendations.forEach((recommendation, index) => {
        this.checkPageBreak(15)

        this.doc.setFontSize(11)
        this.doc.setFont('helvetica', 'normal')

        const lines = this.doc.splitTextToSize(
          `${index + 1}. ${recommendation}`,
          160
        )
        lines.forEach((line: string) => {
          this.doc.text(line, this.margin, this.yPosition)
          this.yPosition += 6
        })

        this.yPosition += 4
      })
    }

    if (result.riskFactors.length > 0) {
      this.checkPageBreak(30)

      this.doc.setFontSize(16)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text('Risk Factors', this.margin, this.yPosition)
      this.yPosition += 15

      result.riskFactors.forEach((risk, index) => {
        this.checkPageBreak(10)

        this.doc.setFontSize(11)
        this.doc.setFont('helvetica', 'normal')
        this.doc.text(`• ${risk}`, this.margin, this.yPosition)
        this.yPosition += 8
      })
    }
  }

  private addDisclaimer(): void {
    this.checkPageBreak(40)

    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Important Disclaimer', this.margin, this.yPosition)
    this.yPosition += 15

    const disclaimerText = `This valuation is an estimate based on the information provided and industry benchmarks. Actual business value may vary significantly based on market conditions, buyer perspectives, due diligence findings, and other factors not captured in this analysis. For investment decisions or transactions, consult with qualified financial professionals and consider obtaining a professional business appraisal.

This report was generated by GoodBuy HQ's AI-powered business valuation platform. For more information, visit goodbuyhq.com.`

    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    const lines = this.doc.splitTextToSize(disclaimerText, 160)

    lines.forEach((line: string) => {
      this.checkPageBreak(8)
      this.doc.text(line, this.margin, this.yPosition)
      this.yPosition += 6
    })
  }

  private checkPageBreak(requiredSpace: number): void {
    if (this.yPosition + requiredSpace > this.pageHeight) {
      this.doc.addPage()
      this.yPosition = 20
    }
  }
}

export async function exportToPDF(result: ValuationResult): Promise<void> {
  const exporter = new PDFExporter()
  await exporter.exportValuationReport(result)
}
