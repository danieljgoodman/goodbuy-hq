import { ValuationResult, EvaluationFormData } from '@/types/valuation'

export interface SavedEvaluation {
  id: string
  userId: string
  companyName: string
  formData: EvaluationFormData
  result: ValuationResult
  createdAt: string
  updatedAt: string
}

export class EvaluationStorage {
  // In a real implementation, these would interact with your database
  // For now, we'll use localStorage for demo purposes

  static async saveEvaluation(
    userId: string,
    formData: EvaluationFormData,
    result: ValuationResult
  ): Promise<SavedEvaluation> {
    const evaluation: SavedEvaluation = {
      id: this.generateId(),
      userId,
      companyName: formData.basicInfo.companyName,
      formData,
      result,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Save to localStorage (in production, this would be a database call)
    const saved = this.getSavedEvaluations(userId)
    saved.push(evaluation)
    localStorage.setItem(`evaluations_${userId}`, JSON.stringify(saved))

    return evaluation
  }

  static async updateEvaluation(
    userId: string,
    evaluationId: string,
    formData: EvaluationFormData,
    result: ValuationResult
  ): Promise<SavedEvaluation> {
    const saved = this.getSavedEvaluations(userId)
    const index = saved.findIndex(e => e.id === evaluationId)

    if (index === -1) {
      throw new Error('Evaluation not found')
    }

    saved[index] = {
      ...saved[index],
      formData,
      result,
      updatedAt: new Date().toISOString(),
    }

    localStorage.setItem(`evaluations_${userId}`, JSON.stringify(saved))
    return saved[index]
  }

  static getSavedEvaluations(userId: string): SavedEvaluation[] {
    if (typeof window === 'undefined') return []

    const saved = localStorage.getItem(`evaluations_${userId}`)
    return saved ? JSON.parse(saved) : []
  }

  static async getEvaluation(
    userId: string,
    evaluationId: string
  ): Promise<SavedEvaluation | null> {
    const saved = this.getSavedEvaluations(userId)
    return saved.find(e => e.id === evaluationId) || null
  }

  static async deleteEvaluation(
    userId: string,
    evaluationId: string
  ): Promise<void> {
    const saved = this.getSavedEvaluations(userId)
    const filtered = saved.filter(e => e.id !== evaluationId)
    localStorage.setItem(`evaluations_${userId}`, JSON.stringify(filtered))
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
  }
}

// Database schema for production implementation
export const evaluationSchema = `
CREATE TABLE IF NOT EXISTS business_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  form_data JSONB NOT NULL,
  valuation_result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_evaluations_user_id (user_id),
  INDEX idx_evaluations_company_name (company_name),
  INDEX idx_evaluations_created_at (created_at)
);
`
