import Layout from "../src/components/Layout";
import { empresa } from "../src/lib/empresa";

export default function SobrePage() {
  return (
    <Layout
      title="Sobre a Mondialle"
      page="sobre"
      empresa={empresa}
      stylesheets={["/assets/css/sobre.css"]}
    >
      <main className="paginaSobre">
        <section className="heroSobre">
          <div className="divHeroSobre">
            <p className="institucional">INSTITUCIONAL</p>

            <h1>
              Sobre a <br />
              <span className="mondialleSobre">MONDIALLE</span>
            </h1>

            <p className="textoIntro">Conectamos pessoas, patrimônios e oportunidades com segurança, 
              transparência e visão estratégica.</p>
          </div>

          <img src="/assets/images/Faixada_mondialle.png" alt="Foto da mondialle" />
          <div className="cirBlur3"></div>
        </section>

        <div className="divPrincipal">
          <div className="textProposito">
            <p>
              A  <span className="propMondialle"> Mondialle </span>  
              nasceu com o propósito de oferecer uma experiência imobiliária mais humana, 
              segura e eficiente. Atuamos com 
              <span className="prop01"> seriedade </span>, 
              <span className="prop02"> atenção aos detalhes </span> e  
              <span className="prop03"> compromisso com cada etapa do processo </span>, 
              ajudando nossos clientes a tomar decisões com confiança.
            </p>
          </div>

          <div className="divPorque">
            <img src="/assets/images/Faixada_mondialle.png" alt="Foto do porque" />
            <div className="textPorque">
              <h2>Por que escolher a Mondialle?</h2>

              <p>Cada cliente possui uma necessidade única.
                Por isso, a Mondialle trabalha com atendimento próximo,
                estratégia personalizada e total transparência,
                oferecendo suporte completo para quem busca segurança e
                tranquilidade em cada decisão.</p>

              <div className="listaPorque">
                <span><i className="fa-solid fa-circle-check" />Atendimento próximo e personalizado</span>
                <span><i className="fa-solid fa-circle-check" />Transparência em todas as etapas</span>
                <span><i className="fa-solid fa-circle-check" />Conhecimento de mercado</span>
                <span><i className="fa-solid fa-circle-check" />Soluções imobiliárias e ambientais</span>
              </div>
            </div>
          </div>

          <div className="citacao">
            <h3>“A qualidade é lembrada muito depois que o preço é esquecido.”</h3>
            <p>- Aldo Gucci</p>
          </div>

        </div>
      </main>
    </Layout>
  );
}
