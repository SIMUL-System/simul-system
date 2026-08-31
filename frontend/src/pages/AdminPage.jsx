import {
  NavLink,
  Outlet,
} from 'react-router-dom'

import '../App.css'

function AdminPage() {
  function obterClasseLink({
    isActive,
  }) {
    return isActive
      ? 'admin-nav__link admin-nav__link--ativo'
      : 'admin-nav__link'
  }

  return (
    <main className="app">
      <section className="consulta">
        <header className="consulta__cabecalho">
          <span className="consulta__marca">
            SIMUL
          </span>

          <h1>
            Painel administrativo
          </h1>

          <p>
            Gerencie rotas, áreas atendidas
            e cronogramas da coleta seletiva.
          </p>
        </header>

        <nav className="admin-nav">
          <NavLink
            to="/admin"
            end
            className={
              obterClasseLink
            }
          >
            Visão geral
          </NavLink>

          <NavLink
            to="/admin/rotas"
            className={
              obterClasseLink
            }
          >
            Rotas
          </NavLink>

          <NavLink
            to="/admin/areas"
            className={
              obterClasseLink
            }
          >
            Áreas atendidas
          </NavLink>

          <NavLink
            to="/admin/cronogramas"
            className={
              obterClasseLink
            }
          >
            Cronogramas
          </NavLink>
        </nav>

        <section className="admin-conteudo">
          <Outlet />
        </section>
      </section>
    </main>
  )
}

export default AdminPage