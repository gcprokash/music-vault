// =========================================================
// MUSIC VAULT
// Library Filter UI
// =========================================================


// ---------------------------------------------------------
// Library Filters
// ---------------------------------------------------------

const libraryFilters =
  document.querySelectorAll(".library-filter");

const musicCards =
  document.querySelectorAll(".music-card");


libraryFilters.forEach((button) => {

  button.addEventListener("click", () => {

    // ---------------------------------------------
    // Active Filter Button
    // ---------------------------------------------

    libraryFilters.forEach((item) => {
      item.classList.remove("active");
    });

    button.classList.add("active");


    // ---------------------------------------------
    // Selected Filter
    // ---------------------------------------------

    const selectedFilter =
      button.dataset.filter;


    // ---------------------------------------------
    // Filter Music Cards
    // ---------------------------------------------

    musicCards.forEach((card) => {

      const cardTags =
        card.dataset.tags || "";


      // Show all cards
      if (selectedFilter === "all") {

        card.style.display = "";

        return;
      }


      // Check card tags
      const hasFilter =
        cardTags
          .split(" ")
          .includes(selectedFilter);


      if (hasFilter) {

        card.style.display = "";

      } else {

        card.style.display = "none";

      }

    });

  });

});