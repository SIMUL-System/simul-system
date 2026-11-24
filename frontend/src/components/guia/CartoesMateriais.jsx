import Icone from '../Icone'
import Lixeira from './Lixeira'

import { MATERIAIS } from '../../utils/guiaConteudo'

/** Um cartão por material, que abre para mostrar o que vai e o que não vai. */
function CartoesMateriais() {
  return (
    <div className="materiais">
      {MATERIAIS.map((material) => (
        <details
          key={material.id}
          className="material"
          style={{ '--cor-material': `var(--${material.cor})` }}
        >
          <summary className="material__resumo">
            <Lixeira
              cor={material.cor}
              humor="feliz"
              tamanho={44}
            />

            <span className="material__nome">
              {material.nome}
            </span>

            <span
              className="material__seta"
              aria-hidden="true"
            >
              <Icone
                nome="seta"
                tamanho={18}
              />
            </span>
          </summary>

          <div className="material__conteudo">
            <div>
              <h4 className="material__titulo material__titulo--vai">
                <Icone
                  nome="sucesso"
                  tamanho={18}
                />
                Vai
              </h4>

              <ul>
                {material.vai.map((texto) => (
                  <li key={texto}>{texto}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="material__titulo material__titulo--nao">
                <Icone
                  nome="erro"
                  tamanho={18}
                />
                Não vai
              </h4>

              <ul>
                {material.naoVai.map((texto) => (
                  <li key={texto}>{texto}</li>
                ))}
              </ul>
            </div>

            <p className="material__dica">
              <Icone
                nome="info"
                tamanho={18}
              />
              {material.dica}
            </p>
          </div>
        </details>
      ))}
    </div>
  )
}

export default CartoesMateriais
