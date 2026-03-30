import { Code, Database, Layout, Server } from "lucide-react"

const highlights = [
  {
    icon: Server,
    title: "Backend",
    description: "APIs RESTful robustas com .NET Core, C# e PHP",
  },
  {
    icon: Layout,
    title: "Frontend",
    description: "Interfaces modernas com HTML e CSS",
  },
  {
    icon: Database,
    title: "Banco de Dados",
    description: "Modelagem e otimização com MySQL Workbench",
  },
  {
    icon: Code,
    title: "Boas Práticas",
    description: "Clean Code, SOLID e Design Patterns",
  },
]

export function AboutSection() {
  return (
    <section id="about" className="py-20 md:py-32 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-primary font-mono text-sm mb-2">Sobre Mim</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
              Paixão por Código de Qualidade
            </h2>
            <div className="w-20 h-1 bg-primary mx-auto" />
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-muted-foreground leading-relaxed text-lg">
                Sou um desenvolvedor Full Stack com foco em tecnologias .NET, apaixonado 
                por criar soluções que combinam performance, escalabilidade e experiência 
                do usuário excepcional.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Com experiência em desenvolvimento de aplicações web completas, trabalho 
                desde a concepção da arquitetura até a implementação final, sempre seguindo 
                as melhores práticas do mercado e mantendo o código limpo e manutenível.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Acredito que um bom software é aquele que resolve problemas reais de forma 
                elegante, e estou constantemente aprendendo novas tecnologias para entregar 
                as melhores soluções possíveis.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors group"
                >
                  <item.icon className="h-10 w-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
