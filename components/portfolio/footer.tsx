import { Github, Linkedin, Mail } from "lucide-react"
import Link from "next/link"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <Link href="#home" className="text-xl font-bold text-primary">
                {"<Pedro />"}
              </Link>
              <p className="text-sm text-muted-foreground mt-2">
                Pedro Costa - Desenvolvedor Full Stack
              </p>
            </div>

            <div className="flex items-center gap-6">
              <Link
                href="https://github.com/pedrodevv17"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link
                href="https://linkedin.com/in/pedrodevv17"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link
                href="mailto:pedrodevv17@gmail.com"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </Link>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8">
            <p className="text-center text-sm text-muted-foreground">
              &copy; {currentYear} Todos os direitos reservados. Feito com dedicação.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
