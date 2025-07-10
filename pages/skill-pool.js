import { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';

export default function SkillsPoolPage() {
  const [skills, setSkills] = useState([]);

  useEffect(() => {
  const stored = localStorage.getItem('skillsPool');
  try {
    const parsed = stored ? JSON.parse(stored) : [];
    const migrated = parsed.map(item =>
      typeof item === 'string' ? { name: item, category: 'Hard' } : item
    );
    if (Array.isArray(migrated) && migrated.length > 0) {
      setSkills(migrated);
    }
  } catch (e) {
    console.error('Ошибка при чтении skillsPool:', e);
  }
}, []);


  useEffect(() => {
    localStorage.setItem('skillsPool', JSON.stringify(skills));
  }, [skills]);

  const addSkill = () => {
    setSkills(prev => [...prev, { name: '', category: 'Hard' }]);
  };

  const updateSkillName = (index, value) => {
    const copy = [...skills];
    copy[index].name = value;
    setSkills(copy);
  };

  const updateSkillCategory = (index, value) => {
    const copy = [...skills];
    copy[index].category = value;
    setSkills(copy);
  };

  const deleteSkill = (index) => {
    setSkills(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div style={{ padding: '30px', maxWidth: 900, margin: '0 auto' }}>
      <NavBar />
      <h2 style={{ marginBottom: 20 }}>📋 Пул навыков</h2>
      <table style={{
        borderCollapse: 'collapse',
        width: '100%',
        backgroundColor: '#1e1e1e',
        color: '#f1f1f1',
        border: '1px solid #333'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#2a2a2a' }}>
            <th style={{ padding: '10px', border: '1px solid #444' }}>№</th>
            <th style={{ padding: '10px', border: '1px solid #444' }}>Название</th>
            <th style={{ padding: '10px', border: '1px solid #444' }}>Категория</th>
            <th style={{ padding: '10px', border: '1px solid #444' }}></th>
          </tr>
        </thead>
        <tbody>
          {skills.map((skill, index) => (
            <tr key={index}>
              <td style={{ textAlign: 'center', border: '1px solid #444', padding: '8px' }}>
                {index + 1}
              </td>
              <td style={{ border: '1px solid #444', padding: '8px' }}>
                <input
                  type="text"
                  value={skill.name}
                  onChange={(e) => updateSkillName(index, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px',
                    backgroundColor: '#2a2a2a',
                    color: '#fff',
                    border: '1px solid #555',
                    borderRadius: 4
                  }}
                />
              </td>
              <td style={{ border: '1px solid #444', padding: '8px' }}>
                <select
                  value={skill.category}
                  onChange={(e) => updateSkillCategory(index, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px',
                    backgroundColor: '#2a2a2a',
                    color: '#fff',
                    border: '1px solid #555',
                    borderRadius: 4
                  }}
                >
                  <option value="Hard">Hard</option>
                  <option value="Soft">Soft</option>
                </select>
              </td>
              <td style={{ textAlign: 'center', border: '1px solid #444' }}>
                <button
                  onClick={() => deleteSkill(index)}
                  style={{
                    padding: '6px 10px',
                    backgroundColor: '#dc3545',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  🗑
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 20, textAlign: 'left' }}>
        <button
          onClick={addSkill}
          style={{
            padding: '10px 16px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '15px'
          }}
        >
          ➕ Добавить навык
        </button>
      </div>
    </div>
  );
}
