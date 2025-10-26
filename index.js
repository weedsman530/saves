async function loadExcelFiles() {
  try {
    const response = await fetch("https://raw.githubusercontent.com/weedsman530/website/main/consult-adult.xlsx");
    const arrayBuffer = await response.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    const workbook = XLSX.read(data, { type: "array" });

    const sheetCount = workbook.SheetNames.length; // نقرأ كل الشيتات

    for (let i = 0; i < sheetCount; i++) {
      const sheetName = workbook.SheetNames[i];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet);

      const container = document.getElementById(`gridContainer${i+1}`);
      if (!container) continue;
      container.innerHTML = "";

      rows.forEach(row => {
        const card = document.createElement("div");
        card.className = "card";

        const img = document.createElement("img");
        img.src = row["photo"] || "https://via.placeholder.com/200x180?text=No+Image";
        card.appendChild(img);

        const name = document.createElement("h3");
        name.textContent = row["Product name"] || "Unnamed Product";
        card.appendChild(name);

        const ingredients = document.createElement("div");
        ingredients.className = "active-ingredients";
        ingredients.innerHTML = `
          <b>Code & Info:</b> ${row["Code and info"] || "—"}<br>
          <b>Content:</b> ${row["Content"] || "—"}<br>
        `;
        card.appendChild(ingredients);

        const dose = document.createElement("div");
        dose.className = "dose";
        dose.style.textAlign = "right";
        dose.innerHTML = `<b>الجرعه:</b> ${row["Dose"] || "—"}`;
        card.appendChild(dose);

        container.appendChild(card);
      });
    }

    enableSearch(); // شغل البحث بعد تحميل البيانات

  } catch (error) {
    console.error("Error loading Excel file:", error);
  }
}

// البحث على الاسم أو الكود
function enableSearch() {
  const searchInput = document.getElementById("searchInput");
  const allContainers = document.querySelectorAll("[id^='gridContainer']");

  // رسالة لا توجد نتائج
  let noResults = document.getElementById("noResults");
  if (!noResults) {
    noResults = document.createElement("p");
    noResults.id = "noResults";
    noResults.textContent = "❌ لا توجد نتائج مطابقة";
    noResults.style.textAlign = "center";
    noResults.style.display = "none";
    noResults.style.fontWeight = "bold";
    noResults.style.color = "darkred";
    document.body.appendChild(noResults);
  }

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    let foundAny = false;

    allContainers.forEach(container => {
      let foundInThisContainer = false;
      const cards = container.querySelectorAll(".card");

      cards.forEach(card => {
        const name = card.querySelector("h3")?.textContent.toLowerCase() || "";
        const code = card.querySelector(".active-ingredients")?.textContent.toLowerCase() || "";

        if (name.includes(query) || code.includes(query)) {
          card.style.display = "block";
          foundInThisContainer = true;
          foundAny = true;
        } else {
          card.style.display = "none";
        }
      });

      if (foundInThisContainer) container.classList.add("show");
      else container.classList.remove("show");
    });

    noResults.style.display = foundAny ? "none" : "block";
  });
}

// التحكم في السلايدز والكونتينرات
document.querySelectorAll(".slide").forEach(slide => {
  slide.addEventListener("click", () => {

    // 🟢 تفريغ محتوى الانبوت عند الضغط على أي سلايد
    document.getElementById("searchInput").value = "";

    // 🟢 كمان نرجع نعرض كل الكروت اللي كانت مخفية
    document.querySelectorAll(".card").forEach(card => card.style.display = "block");

    // 🔸 إخفاء كل الكونتينرات القديمة
    document.querySelectorAll("[id^='gridContainer']").forEach(c => c.classList.remove("show"));
    document.querySelectorAll("[class^='adult']").forEach(a => a.classList.remove("show"));

    // 🔸 إظهار الكونتينر الجديد حسب السلايد المضغوط عليه
    const targetId = slide.getAttribute("data-target");
    const targetContainer = document.getElementById(targetId);
    if (targetContainer) targetContainer.classList.add("show");

    const match = targetId.match(/\d+/);
    if (match) {
      const index = match[0];
      const targetAdult = document.querySelector(`.adult${index === "1" ? "" : index}`);
      if (targetAdult) targetAdult.classList.add("show");
    }
  });
});

// شغل تحميل الإكسل
loadExcelFiles();
