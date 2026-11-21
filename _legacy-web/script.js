document.querySelectorAll("button").forEach((button) => {
  button.addEventListener("click", () => {
    button.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(.97)" },
        { transform: "scale(1)" }
      ],
      { duration: 180 }
    );
  });
});
