async function fetchListings() {
  try {
    const res = await fetch("/api/admin/listings", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    console.log("API Response Status:", res.status);

    const data = await res.json();
    console.log("API Response Data:", data);

    // Validate result
    if (!data.result || !Array.isArray(data.result)) {
      throw new Error("Listings data is not an array.");
    }

    const listings = data.result;
    const listElement = document.getElementById("listings");
    listElement.innerHTML = "";

    listings.forEach((listing) => {
      const li = document.createElement("li");
      li.innerHTML = `
        ${listing.name} (Lat: ${listing.latitude}, Lon: ${listing.longitude})
        <button onclick="editListing('${listing._id}', '${listing.name}', ${listing.latitude}, ${listing.longitude})">Edit</button>
        <button onclick="deleteListing('${listing._id}')">Delete</button>
      `;
      listElement.appendChild(li);
    });
  } catch (error) {
    console.error("Error loading listings:", error);
    alert(error.message);
  }
}

async function saveListing(e) {
  e.preventDefault();

  const id = document.getElementById("listingId").value;
  const name = document.getElementById("name").value;
  const latitude = parseFloat(document.getElementById("latitude").value);
  const longitude = parseFloat(document.getElementById("longitude").value);

  const method = id ? "PUT" : "POST";
  const url = id ? `/api/admin/listings/${id}` : "/api/admin/listings";

  try {
    const res = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ name, latitude, longitude }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        errorData.message || `Failed to ${id ? "update" : "add"} listing`
      );
    }

    alert(`Listing ${id ? "updated" : "added"} successfully!`);
    fetchListings();
    resetForm();
  } catch (error) {
    console.error(`Error ${id ? "updating" : "adding"} listing:`, error);
    alert(error.message);
  }
}

function editListing(id, name, latitude, longitude) {
  document.getElementById("listingId").value = id;
  document.getElementById("name").value = name;
  document.getElementById("latitude").value = latitude;
  document.getElementById("longitude").value = longitude;
  document.getElementById("formTitle").innerText = "Edit Listing";
  document.getElementById("cancelEdit").style.display = "inline";
}

function resetForm() {
  document.getElementById("listingId").value = "";
  document.getElementById("name").value = "";
  document.getElementById("latitude").value = "";
  document.getElementById("longitude").value = "";
  document.getElementById("formTitle").innerText = "Add Listing";
  document.getElementById("cancelEdit").style.display = "none";
}

// Delete Listing
async function deleteListing(id) {
  try {
    const res = await fetch(`/api/admin/listings/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to delete listing");
    }

    fetchListings();
  } catch (error) {
    console.error("Error deleting listing:", error);
    alert(error.message);
  }
}

// Initial Fetch
fetchListings();
