import { DeliverableForm } from "@/components/deliverable-form"

export default function NewDeliverablePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Deliverable</h1>
        <p className="text-muted-foreground">
          Fill out the form below to create a new social media deliverable
        </p>
      </div>
      <DeliverableForm />
    </div>
  )
}

