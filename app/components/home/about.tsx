import { Container } from "../container";
import { PageTitle } from "../page-title";

export function About() {
  return (
    <Container>
      <PageTitle title="About" />
      <p className="text-lg" id="about">
        MEMS (Military Equipment Maintenance System) is a cutting-edge software
        solution designed to revolutionize the way military equipment
        maintenance is managed. Developed by a team of experienced engineers and
        military experts, MEMS is built to streamline maintenance operations,
        enhance equipment readiness, and ultimately ensure mission success.
      </p>
    </Container>
  );
}
