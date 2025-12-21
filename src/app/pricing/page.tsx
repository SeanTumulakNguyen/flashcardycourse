import { PricingTable } from "@clerk/nextjs";

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-foreground">
            Choose Your Plan
          </h1>
          <p className="text-lg text-muted-foreground">
            Select the perfect plan for your flashcard learning journey
          </p>
        </div>
        <PricingTable />
      </div>
    </div>
  );
}

