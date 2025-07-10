import Link from 'next/link';
import { useRouter } from 'next/router';
import { useRef } from 'react';

const NavBar = () => {
  const router = useRouter();
  const fileInputRef = useRef();

  const handleExport = () => {
    const data = {
      skills: JSON.parse(localStorage.getItem('skills') || '[]'),
      skillPool: JSON.parse(localStorage.getItem('skillPool') || '[]'),
      requirementsDepartments: JSON.parse(localStorage.getItem('requirementsDepartments') || '[]')
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'skill-tree-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.skills) localStorage.setItem('skills', JSON.stringify(data.skills));
        if (data.skillPool) localStorage.setItem('skillPool', JSON.stringify(data.skillPool));
        if (data.requirementsDepartments) localStorage.setItem('requirementsDepartments', JSON.stringify(data.requirementsDepartments));
        alert('✅ Данные успешно импортированы! Обнови страницу.');
      } catch (e) {
        alert('❌ Ошибка при импорте данных. Проверь файл.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 10, backgroundColor: '#1a1a1a', color: 'white' }}>
      <div style={{ display: 'flex', gap: 20 }}>
        <Link href="/skill-pool">📦 Скилл-Пулл</Link>
        <Link href="/skills">🧠 Навыки сотрудника</Link>
        <Link href="/requirements">📐 Требования</Link>
        <Link href="/flow">📊 Грейды</Link>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={handleExport} style={{ padding: '4px 8px' }}>📤 Экспорт</button>
        <button onClick={() => fileInputRef.current?.click()} style={{ padding: '4px 8px' }}>📥 Импорт</button>
        <input type="file" accept="application/json" ref={fileInputRef} onChange={handleImport} style={{ display: 'none' }} />
      </div>
    </nav>
  );
};

export default NavBar;
