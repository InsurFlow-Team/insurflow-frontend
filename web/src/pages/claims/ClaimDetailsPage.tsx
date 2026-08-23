import { useParams } from 'react-router'

export function ClaimDetailsPage() {
  const { claimId } = useParams()

  return (
    <main>
      <h1>Claim Details</h1>
      <p>Claim Number: {claimId}</p>
    </main>
  )
}