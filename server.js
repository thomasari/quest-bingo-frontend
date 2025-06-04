import sirv from "sirv";
import polka from "polka";

const serve = sirv("dist", { single: true });

polka()
  .use(serve)
  .listen(process.env.PORT || 3000, () => {
    console.log("Frontend running on port", process.env.PORT || 3000);
  });
