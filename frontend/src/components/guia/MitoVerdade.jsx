import { useState } from 'react'

import Icone from '../Icone'

import { MITOS } from '../../utils/guiaConteudo'

/**
 * Cartões "Mito ou verdade?": o morador responde e o cartão vira
 * mostrando a explicação.
 */
function MitoVerdade() {
  const [respostas, setRespostas] = useState({})

  function responder(indice, palpite) {
    setRespostas((atuais) => ({
      ...atuais,
      [indice]: palpite,
    }))
  }

  return (
    <ul className="mitos">
      {MITOS.map((mito, indice) => {
        const palpite = respostas[indice]
        const respondido = palpite !== undefined
        const acertou = palpite === mito.verdade

        return (
          <li key={mito.frase} className={respondido ? 'mito mito--virado' : 'mito'}>
            <p className="mito__frase">“{mito.frase}”</p>

            {!respondido ? (
              <div className="mito__botoes" role="group" aria-label="Sua resposta">
                <button
                  type="button"
                  className="botao botao--secundario botao--pequeno"
                  onClick={() => responder(indice, false)}
                >
                  Mito
                </button>

                <button
                  type="button"
                  className="botao botao--secundario botao--pequeno"
                  onClick={() => responder(indice, true)}
                >
                  Verdade
                </button>
              </div>
            ) : (
              <div className="mito__resposta" role="status">
                <p
                  className={
                    acertou
                      ? 'mito__veredito mito__veredito--certo'
                      : 'mito__veredito mito__veredito--errado'
                  }
                >
                  <Icone nome={acertou ? 'sucesso' : 'info'} tamanho={18} />
                  {acertou ? 'Você acertou!' : 'Boa tentativa!'}
                </p>

                <p>{mito.resposta}</p>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export default MitoVerdade
