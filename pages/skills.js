import React, { useEffect, useState } from 'react'
import NavBar from '../components/NavBar'

const LEVELS = [0, 1, 2, 3]

export default function SkillsPage() {
  const [skills, setSkills] = useState(null) // ← важно: null, чтобы отличать “не загружено” от []

  useEffect(() => {
    const savedSkillsRaw = localStorage.getItem('skills')
    if (savedSkillsRaw) {
      try {
        const parsed = JSON.parse(savedSkillsRaw)
        setSkills(parsed)
        return
      } catch (e) {
        console.error('Ошибка чтения skills:', e)
      }
    }

    // Если нет сохранённых — создаём по requirements
    const reqRaw = localStorage.getItem('requirements')
    if (!reqRaw) return

    try {
      const requirements = JSON.parse(reqRaw)
      const uniqueSkills = [
        ...new Set(
          requirements
            .filter((r) => r.type === 'skill')
            .map((r) => r.skill)
        ),
      ]

      const initialSkills = uniqueSkills.map((name) => ({
        name,
        level: 0,
      }))

      localStorage.setItem('skills', JSON.stringify(initialSkills))
      setSkills(initialSkills)
    } catch (e) {
      console.error('Ошибка парсинга requirements:', e)
    }
  }, [])

  const updateLevel = (index, level) => {
    if (!skills) return
    const updated = [...skills]
    updated[index].level = level
    setSkills(updated)
    localStorage.setItem('skills', JSON.stringify(updated))
  }

  if (!skills) return <div style={{ padding: 20, color: '#fff' }}>Загрузка...</div>

  return (
    <div style={{ padding: 20 }}>
      <NavBar />

      <h2 style={{ marginBottom: 20, color: '#fff' }}>Уровни навыков сотрудника</h2>

      <table
        style={{
          borderCollapse: 'collapse',
          width: '100%',
          backgroundColor: '#111',
          color: '#fff',
        }}
      >
        <thead style={{ backgroundColor: '#1f2937' }}>
          <tr>
            <th style={{ border: '1px solid #444', padding: 8 }}>Навык</th>
            <th style={{ border: '1px solid #444', padding: 8 }}>Уровень</th>
          </tr>
        </thead>
        <tbody>
          {skills.map((s, index) => (
            <tr key={s.name}>
              <td style={{ border: '1px solid #333', padding: 8 }}>{s.name}</td>
              <td style={{ border: '1px solid #333', padding: 8 }}>
                <select
                  value={s.level}
                  onChange={(e) => updateLevel(index, parseInt(e.target.value))}
                >
                  {LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
