import Container from "@/components/ui/Container"
import FaqAccordion from "@/components/marketing/FaqAccordion"

export const metadata = {
  title: "FAQ — FlowBook",
  description:
    "Frequently asked questions about FlowBook booking software."
}

export default function FaqPage() {
  return (
    <main>
      <section className="py-24">
        <Container className="max-w-3xl mx-auto space-y-12">

          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Frequently asked questions
            </h1>
            <p className="text-secondaryText">
              Everything you need to know before subscribing.
            </p>
          </div>

          <FaqAccordion />

        </Container>
      </section>
    </main>
  )
}