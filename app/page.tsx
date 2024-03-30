import Image from "next/image";

export default function Home() {
  return (
    <div
      style={{
        textAlign: "center",
        height: "100vh",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h1
        style={{
          color: "blue",
          fontSize: "50px",
          fontFamily: "Arial",
          fontWeight: "bold",
        }}
      >
        Welcome to Keptn! KDB-BoT is here to assist you!🧑‍🍳
      </h1>
      <p style={{ fontSize: "20px" }}>KDB-BoT is a GitHub Bot</p>

      <p
        style={{
          fontSize: "20px",
          fontFamily: "Arial",
          color: "blue",
          fontWeight: "bold",
          textAlign: "justify",
        }}
      >
        This bot is used to assign and unassign issues to users in a GitHub
        repository. It can be used to manage the workload of a team by assigning
        issues to the right person. The bot listens for comments in the
        repository and assigns or unassigns issues based on the commands in the
        comments.
      </p>
    </div>
  );
}
