import { ExternalLink, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const projects = [
  {
    title: "E-Commerce API",
    description:
      "Loja virtual completa com carrinho de compras, gestão de produtos, processamento de pedidos e painel administrativo.",
    technologies: ["C#", ".NET Core", "MySQL", "Entity Framework"],
    image: "/placeholder.svg?height=400&width=600",
    github: "https://github.com/pedrodevv17",
    demo: "/ecommerce",
    isInternal: true,
  },
  {
    title: "Sistema de Gestão",
    description:
      "Sistema completo de gestão empresarial com dashboard interativo, cadastro de produtos, clientes e documentos.",
    technologies: [".NET Core", "MySQL", "HTML", "CSS"],
    image: "/placeholder.svg?height=400&width=600",
    github: "https://github.com/pedrodevv17",
    demo: "/sistema-gestao",
    isInternal: true,
  },
  {
    title: "Portal de Atendimento",
    description:
      "Sistema de tickets com chat em tempo real, gerenciamento de chamados, prioridades e histórico de conversas.",
    technologies: ["C#", "SignalR", "MySQL", "Bootstrap"],
    image: "/placeholder.svg?height=400&width=600",
    github: "https://github.com/pedrodevv17",
    demo: "/portal-atendimento",
    isInternal: true,
  },
  {
    title: "Dashboard Analytics",
    description:
      "Dashboard de análise de dados com gráficos interativos, KPIs personalizados, filtros avançados e exportação.",
    technologies: [".NET Core", "Chart.js", "MySQL", "REST API"],
    image: "/placeholder.svg?height=400&width=600",
    github: "https://github.com/pedrodevv17",
    demo: "/dashboard-analytics",
    isInternal: true,
  },
]

type Project = (typeof projects)[number]


export function ProjectsSection() {
  return (
    <section id="projects" className="py-20 md:py-32 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-primary font-mono text-sm mb-2">Portfólio</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
              Projetos em Destaque
            </h2>
            <div className="w-20 h-1 bg-primary mx-auto mb-6" />
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Uma seleção dos meus trabalhos mais recentes e relevantes
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {projects.map((project) => (
              <article
                key={project.title}
                className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300"
              >
                <div className="aspect-video bg-secondary/50 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-6xl font-mono text-primary/20">{"</>"}</div>
                  </div>
                  <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex gap-4">
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link href={project.github} target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4 mr-2" />
                        Código
                      </Link>
                    </Button>
                    {project.demo && (
                      <Button asChild size="sm" className="flex-1">
                        <Link 
                          href={project.demo} 
                          {...((project as Project & { isInternal?: boolean }).isInternal ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Demo
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
