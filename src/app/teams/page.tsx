import { getAllTeams } from "@/lib/queries/teams";
import { TeamCard } from "@/components/cards/team-card";
import Link from "next/link";

export default async function TeamsPage() {
  const teams = await getAllTeams();

  const activeTeams = teams.filter(t => t.isActive);
  const defunctTeams = teams.filter(t => !t.isActive);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Teams</h1>
        <p className="text-muted-foreground mt-1">
          Explore franchise stats, head-to-head records, and player contributions
        </p>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Active Franchises</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {activeTeams.map(team => (
            <Link key={team.id} href={`/teams/${team.slug}`}>
              <TeamCard
                name={team.name}
                shortCode={team.shortCode}
                color={team.color}
                matchesPlayed={team.matchesPlayed}
                matchesWon={team.matchesWon}
                winPercentage={team.winPercentage}
                titles={team.titles}
                isActive={team.isActive}
              />
            </Link>
          ))}
        </div>
      </div>

      {defunctTeams.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Former Franchises</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {defunctTeams.map(team => (
              <Link key={team.id} href={`/teams/${team.slug}`}>
                <TeamCard
                  name={team.name}
                  shortCode={team.shortCode}
                  color={team.color}
                  matchesPlayed={team.matchesPlayed}
                  matchesWon={team.matchesWon}
                  winPercentage={team.winPercentage}
                  titles={team.titles}
                  isActive={team.isActive}
                />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
