import Link from "next/link";
import PageContainer from "@/components/ui/page-container";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";

export default function HomePage() {
  return (
    <PageContainer>
      <Card
        title="OWASP Security Demo"
        description="A simple frontend for demonstrating common web vulnerabilities and their defenses."
      >
        <div className="space-y-3">
          <Link href="/register" className="block">
            <Button fullWidth>Register</Button>
          </Link>

          <Link href="/login" className="block">
            <Button variant="secondary" fullWidth>
              Login
            </Button>
          </Link>
        </div>
      </Card>
    </PageContainer>
  );
}
