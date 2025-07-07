import React, { useState, useEffect } from 'react'
import NavBar from '../components/NavBar' // добавь импорт

const GRADES = ['Jun', 'Mid', 'Sen', 'Lead']
const LEVELS = [0, 1, 2, 3]

const gradeOrder = { Jun: 0, Mid: 1, Sen: 2, Lead: 3 }

export default function RequirementsPage() {
  const [requirements, setRequirements] = useState([])

  // Загрузка из localStorage — один раз
  useEffect(() => {
    const saved = localStorage.getItem('requirements')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setRequirements(parsed)
      } catch (e) {
        console.error('Ошибка чтения requirements:', e)
      }
    }
  }, [])

  const sortRequirements = (list) => {
    return [...list].sort((a, b) => {
      const ga = gradeOrder[a.grade] ?? 99
      const gb = gradeOrder[b.grade] ?? 99
      if (ga !== gb) return ga - gb
      if (a.level !== b.level) return a.level - b.level
      if (a.skill !== b.skill) return a.skill.localeCompare(b.skill)
      return a.required - b.required
    })
  }

  const save = (list) => {
  localStorage.setItem('requirements', JSON.stringify(list))
  setRequirements(list)
}

const sortAndSave = () => {
  const sorted = sortRequirements(requirements)
  localStorage.setItem('requirements', JSON.stringify(sorted))
  setRequirements(sorted)
}

  const addRow = () => {
    const newRow = {
      grade: 'Jun',
      level: 0,
      skill: '',
      required: 0,
      type: 'skill',
    }
    const updated = [...requirements, newRow]
    save(updated)
  }

  const updateCell = (index, key, value) => {
    const updated = [...requirements]
    updated[index][key] = value

    // Автоматически определяем тип: skill или grade
    const gradeNames = ['Jun', 'Mid', 'Sen', 'Lead']
    updated[index].type = gradeNames.includes(updated[index].skill) ? 'grade' : 'skill'

    save(updated)
  }

  const deleteRow = (index) => {
    const updated = [...requirements]
    updated.splice(index, 1)
    save(updated)
  }

  return (
    <div style={{ padding: 20, color: '#fff' }}>
	<NavBar /> {/* 🔹 вставлен компонент навигации */}

      <h2 style={{ fontWeight: 600, marginBottom: 20 }}>
        Требования для перехода по грейдам
      </h2>
      <table style={{
        borderCollapse: 'collapse',
        width: '100%',
        backgroundColor: '#111',
        border: '1px solid #444',
      }}>
        <thead style={{ backgroundColor: '#1f2937', color: '#f9fafb' }}>
          <tr>
            <th style={{ border: '1px solid #444', padding: 8 }}>Грейд</th>
            <th style={{ border: '1px solid #444', padding: 8 }}>Уровень</th>
            <th style={{ border: '1px solid #444', padding: 8 }}>Навык</th>
            <th style={{ border: '1px solid #444', padding: 8 }}>Требуемый уровень</th>
            <th style={{ border: '1px solid #444', padding: 8 }}></th>
          </tr>
        </thead>
        <tbody>
          {requirements.map((row, index) => (
            <tr key={index}>
              <td style={{ border: '1px solid #333', padding: 6 }}>
                <select
                  value={row.grade}
                  onChange={(e) => updateCell(index, 'grade', e.target.value)}
                  style={{ width: '100%' }}
                >
                  {GRADES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </td>
              <td style={{ border: '1px solid #333', padding: 6 }}>
                <select
                  value={row.level}
                  onChange={(e) => updateCell(index, 'level', parseInt(e.target.value))}
                  style={{ width: '100%' }}
                >
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </td>
              <td style={{ border: '1px solid #333', padding: 6 }}>
                <input
                  value={row.skill}
                  onChange={(e) => updateCell(index, 'skill', e.target.value)}
                  style={{ width: '100%' }}
                />
              </td>
              <td style={{ border: '1px solid #333', padding: 6 }}>
                <select
                  value={row.required}
                  onChange={(e) => updateCell(index, 'required', parseInt(e.target.value))}
                  style={{ width: '100%' }}
                >
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </td>
              <td style={{ border: '1px solid #333', padding: 6 }}>
                <button
                  onClick={() => deleteRow(index)}
                  style={{
                    background: '#444',
                    color: '#fff',
                    border: 'none',
                    padding: '4px 10px',
                    cursor: 'pointer',
                  }}
                >
                  Удалить
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={addRow}
        style={{
          marginTop: 16,
          backgroundColor: '#374151',
          color: '#fff',
          padding: '8px 12px',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
        }}
      >
        ➕ Добавить требование
      </button>
	<button
    	onClick={sortAndSave}
    	style={{
      	backgroundColor: '#2563eb',
      	color: '#fff',
      	padding: '8px 12px',
      	border: 'none',
      	borderRadius: 4,
      	cursor: 'pointer',
    	}}
  	>
   	 🔃 Сортировать таблицу
  	</button>
    </div>
  )
}
