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
        backgroundColor: "darkblue",
        alignItems: "center",
      }}
    >
      <h1
        style={{
          color: "white",
          fontSize: "50px",
          fontFamily: "monospace",
          fontWeight: "bold",
        }}
      >
        Welcome to Keptn! </h1>
    
     <p style={{
      fontSize: "25px",
         fontFamily: "monospace",
         color: "white",
         fontWeight: "bold",
         textAlign: "center",
         padding: "20px",
     }}>KDB-BoT is here to assist you in your first Contribution!🧑‍🍳</p>
       

      <p
        style={{
          fontSize: "25px",
          padding: "20px",
          fontFamily: "monospace",
          color: "white",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        This bot is used to assign and unassign issues to users in a GitHub
        repository Keptn. It can be used to manage the workload of a team by assigning
        issues to the right person. The bot listens for comments in the
        repository and assigns or unassigns issues based on the commands in the
        comments. This bot can be customized to your needs as well.
      </p>
    </div>
  );
}
