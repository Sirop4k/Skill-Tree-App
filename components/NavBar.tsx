import Link from 'next/link'

const NavBar = () => {
  return (
    <nav style={{
      display: 'flex',
      gap: 16,
      padding: '12px 20px',
      backgroundColor: '#1f2937',
      borderBottom: '1px solid #374151',
      marginBottom: 24,
    }}>
      <Link href="/skills">
        <button style={buttonStyle}>Навыки</button>
      </Link>
      <Link href="/requirements">
        <button style={buttonStyle}>Требования</button>
      </Link>
      <Link href="/tree">
        <button style={buttonStyle}>Древо</button>
      </Link>
    </nav>
  )
}

const buttonStyle = {
  backgroundColor: '#374151',
  color: '#fff',
  border: 'none',
  padding: '8px 12px',
  borderRadius: 4,
  cursor: 'pointer',
}

export default NavBar
