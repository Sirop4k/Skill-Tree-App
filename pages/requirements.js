import { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';

export default function RequirementsPage() {
  const [departments, setDepartments] = useState([]);
  const [activeDeptIndex, setActiveDeptIndex] = useState(0);

  useEffect(() => {
  const stored = localStorage.getItem('requirementsDepartments');
  try {
    const parsed = stored ? JSON.parse(stored) : [];
    if (Array.isArray(parsed) && parsed.length > 0) {
      setDepartments(parsed);
    }
  } catch (e) {
    console.error('Ошибка при чтении requirementsDepartments:', e);
  }
}, []);


  useEffect(() => {
    localStorage.setItem('requirementsDepartments', JSON.stringify(departments));
  }, [departments]);

  const addDepartment = () => {
    const name = prompt('Название нового отдела:');
    if (!name) return;
    setDepartments(prev => [...prev, { name, table: [] }]);
    setActiveDeptIndex(departments.length);
  };

  const deleteDepartment = (index) => {
    if (!window.confirm('Удалить этот отдел?')) return;
    const updated = departments.filter((_, i) => i !== index);
    setDepartments(updated);
    if (activeDeptIndex === index) {
      setActiveDeptIndex(0);
    } else if (activeDeptIndex > index) {
      setActiveDeptIndex(prev => prev - 1);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <NavBar />
      <h2>🧩 Требования по отделам</h2>

      {/* Горизонтальный список отделов */}
      <div
        style={{
          display: 'flex',
          overflowX: 'auto',
          marginBottom: 20,
          gap: '10px',
          paddingBottom: 10,
        }}
      >
        {departments.map((dept, index) => (
          <div
            key={index}
            onClick={() => setActiveDeptIndex(index)}
            style={{
              padding: '10px 16px',
              backgroundColor: index === activeDeptIndex ? '#60a5fa' : '#2a2a2a',
              color: index === activeDeptIndex ? '#fff' : '#ccc',
              borderRadius: '6px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}
          >
            {dept.name}
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteDepartment(index);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#f87171',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
          </div>
        ))}
        <button
          onClick={addDepartment}
          style={{
            padding: '10px 16px',
            backgroundColor: '#4ade80',
            color: '#000',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          ➕ Добавить отдел
        </button>
      </div>

      {/* Место под таблицу активного отдела — добавим на следующем шаге */}
      {departments[activeDeptIndex] && (
        <div>
          <h3>Таблица: {departments[activeDeptIndex].name}</h3>
          	<CompetencyMatrix
  		department={departments[activeDeptIndex]}
  		update={(updatedTable) => {
    		const copy = [...departments];
    		copy[activeDeptIndex].table = updatedTable;
    		setDepartments(copy);
  		}}
		/>
        </div>
      )}
    </div>
  );
}

const GRADES = ['Jun', 'Mid', 'Sen', 'Lead'];
const SHIFTS = ['-1', '', '+1'];
const COLS = GRADES.flatMap(g => SHIFTS.map(shift => shift ? `${g}${shift}` : g));

function CompetencyMatrix({ department, update }) {
  const [skillsPool, setSkillsPool] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('skillsPool');
    if (stored) setSkillsPool(JSON.parse(stored));
  }, []);

  const getCategory = (skillName) => {
    const found = skillsPool.find(s => s.name === skillName);
    return found?.category || '';
  };

  const updateCell = (rowIndex, colKey, value) => {
    const updated = department.table.map((row, i) => {
      if (i !== rowIndex) return row;
      const newLevels = { ...row.levels };
      if (value === '') {
        delete newLevels[colKey];
      } else {
        newLevels[colKey] = parseInt(value);
      }
      return { ...row, levels: newLevels };
    });
    update(updated);
  };

  const updateSkill = (rowIndex, newSkill) => {
    const updated = department.table.map((row, i) =>
      i === rowIndex ? { ...row, skill: newSkill } : row
    );
    update(updated);
  };

  const addRow = () => {
    update([...department.table, { skill: '', levels: {} }]);
  };

  const deleteRow = (rowIndex) => {
    update(department.table.filter((_, i) => i !== rowIndex));
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr style={{ backgroundColor: '#333' }}>
            <th style={thStyle}>#</th>
            <th style={thStyle}>Компетенция</th>
            <th style={thStyle}>Категория</th>
            {COLS.map(col => (
              <th key={col} style={thStyle}>{col}</th>
            ))}
            <th style={thStyle}></th>
          </tr>
        </thead>
        <tbody>
          {department.table.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td style={tdStyle}>{rowIndex + 1}</td>
              <td style={tdStyle}>
                <select
                  value={row.skill}
                  onChange={e => updateSkill(rowIndex, e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="">— выберите —</option>
                  {skillsPool.map((s, i) => (
                    <option key={i} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </td>
              <td style={tdStyle}>{getCategory(row.skill)}</td>
              {COLS.map(col => (
                <td key={col} style={tdStyle}>
                  <input
                    type="number"
                    min={1}
                    max={3}
                    value={row.levels?.[col] ?? ''}
                    onChange={e => updateCell(rowIndex, col, e.target.value)}
                    style={{ width: 40, textAlign: 'center' }}
                  />
                </td>
              ))}
              <td style={tdStyle}>
                <button onClick={() => deleteRow(rowIndex)}>🗑</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={addRow} style={{ marginTop: 10 }}>
        ➕ Добавить компетенцию
      </button>
    </div>
  );
}

const thStyle = {
  padding: '8px',
  backgroundColor: '#2a2a2a',
  color: '#fff',
  border: '1px solid #444'
};

const tdStyle = {
  padding: '6px',
  border: '1px solid #444',
  textAlign: 'center',
  backgroundColor: '#1e1e1e',
  color: '#fff'
};





