// src/integrations/supabase/client-local.ts
import Localbase from 'localbase'

const db = new Localbase('sidbio-prototipo')
db.config.debug = false

export const supabase = {
  from: (table: string) => ({
    select: async () => {
      const data = await db.collection(table).get()
      return { data: data || [], error: null }
    },
    insert: async (items: any) => {
      const array = Array.isArray(items) ? items : [items]
      for (const item of array) {
        await db.collection(table).add({
          ...item,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString()
        })
      }
      return { data: array, error: null }
    }
  })
}