import { supabase } from "./supabase.js";

// ===============================
// ADMIN AUTHENTICATION
// ===============================

// Check Admin Login
async function checkAdminLogin() {

    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
        window.location.href = "login.html";
        return false;
    }

    return true;
}

checkAdminLogin();

// Monitor Authentication
supabase.auth.onAuthStateChange((event, session) => {

    if (!session && event === "SIGNED_OUT") {
        window.location.href = "login.html";
    }

});

// Logout Button
const logoutButton = document.querySelector(".logout-btn");

if (logoutButton) {

    logoutButton.addEventListener("click", async () => {

        try {

            const { error } = await supabase.auth.signOut();

            if (error) throw error;

            window.location.href = "login.html";

        } catch (error) {

            console.error("Logout Error:", error);

        }

    });

}

// ===============================
// AWARDS MANAGEMENT
// ===============================

const awardForm = document.getElementById("award-form");
const awardsList = document.getElementById("awards-list");

// Add New Award
if (awardForm) {

    awardForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const title = document.getElementById("award-title").value.trim();
        const year = document.getElementById("award-year").value;
        const description = document.getElementById("award-description").value.trim();
        const imageFile = document.getElementById("award-image").files[0];

        try {

            let imageURL = null;

            // Upload Image
            if (imageFile) {

                if (imageFile.size > 5 * 1024 * 1024) {
                    alert("Image size must not exceed 5MB.");
                    return;
                }

                const allowedTypes = [
                    "image/jpeg",
                    "image/png",
                    "image/webp",
                    "image/gif"
                ];

                if (!allowedTypes.includes(imageFile.type)) {
                    alert("Please select a valid image.");
                    return;
                }

                const fileName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
                const filePath = "awards/" + Date.now() + "-" + fileName;

                const { data: uploadData, error: uploadError } = await supabase
                    .storage
                    .from("moataz-images")
                    .upload(filePath, imageFile);

                if (uploadError) throw uploadError;

                const { data: publicURLData } = supabase
                    .storage
                    .from("moataz-images")
                    .getPublicUrl(uploadData.path);

                imageURL = publicURLData.publicUrl;

            }

            // Save Award
            const { error } = await supabase
                .from("awards")
                .insert([{
                    title: title,
                    year: year,
                    description: description,
                    image_url: imageURL
                }]);

            if (error) throw error;

            alert("Award added successfully!");

            awardForm.reset();

            loadAwards();

        } catch (error) {

            console.error("Error adding award:", error);
            alert("Could not add award. Check the console for details.");

        }

    });

}


// Display Awards
async function loadAwards() {

    if (!awardsList) return;

    try {

        const { data, error } = await supabase
            .from("awards")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        awardsList.innerHTML = "";

        if (!data || data.length === 0) {

            awardsList.innerHTML = "<p>No awards added yet.</p>";
            return;

        }

        data.forEach(function (award) {

            const awardCard = document.createElement("div");
            awardCard.className = "award-card";

            // Award Image
            if (award.image_url) {

                const image = document.createElement("img");
                image.src = award.image_url;
                image.alt = award.title;
                image.style.width = "150px";

                awardCard.appendChild(image);

            }

            const title = document.createElement("h3");
            title.textContent = award.title;

            const year = document.createElement("p");
            year.textContent = "Year: " + award.year;

            const description = document.createElement("p");
            description.textContent = award.description;

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.className = "delete-award-btn";

            deleteButton.addEventListener("click", async function () {

                const confirmed = confirm("Are you sure you want to delete this award?");

                if (!confirmed) return;

                try {

                    const { error } = await supabase
                        .from("awards")
                        .delete()
                        .eq("id", award.id);

                    if (error) throw error;

                    alert("Award deleted successfully!");

                    loadAwards();

                } catch (error) {

                    console.error("Error deleting award:", error);
                    alert("Could not delete award.");

                }

            });

            awardCard.appendChild(title);
            awardCard.appendChild(year);
            awardCard.appendChild(description);
            awardCard.appendChild(deleteButton);

            awardsList.appendChild(awardCard);

        });

    } catch (error) {

        console.error("Awards loading error:", error);
        awardsList.innerHTML = "<p>Unable to load awards.</p>";

    }

}

loadAwards();
// ===============================
// UPLOAD IMAGE TO SUPABASE
// ===============================

async function uploadDashboardImage(file, folder) {

    if (!file) return null;

    if (file.size > 5 * 1024 * 1024) {
        throw new Error("Image size must not exceed 5MB.");
    }

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif"
    ];

    if (!allowedTypes.includes(file.type)) {
        throw new Error("Please select a valid image.");
    }

    const fileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = folder + "/" + Date.now() + "-" + fileName;

    const { data, error } = await supabase
        .storage
        .from("moataz-images")
        .upload(filePath, file);

    if (error) throw error;

    const { data: publicData } = supabase
        .storage
        .from("moataz-images")
        .getPublicUrl(data.path);

    return publicData.publicUrl;
}
// ===============================
// PRODUCTIONS MANAGEMENT
// ===============================

const productionForm = document.getElementById("production-form");
const productionsList = document.getElementById("productions-list");

if (productionForm && productionsList) {

    productionForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const title = document.getElementById("production-title").value.trim();
        const year = document.getElementById("production-year").value;
        const description = document.getElementById("production-description").value.trim();
        const imageFile = document.getElementById("production-image").files[0];

        try {

            const imageURL = await uploadDashboardImage(imageFile, "productions");

            const { error } = await supabase
                .from("productions")
                .insert([{
                    title: title,
                    year: year,
                    description: description,
                    image_url: imageURL
                }]);

            if (error) throw error;

            alert("Production added successfully!");

            productionForm.reset();

            loadProductions();

        } catch (error) {

            console.error("Error adding production:", error);
            alert("Could not add production: " + error.message);

        }

    });


    async function loadProductions() {

        try {

            const { data, error } = await supabase
                .from("productions")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;

            productionsList.innerHTML = "";

            if (!data || data.length === 0) {

                productionsList.innerHTML = "<p>No productions added yet.</p>";
                return;

            }

            data.forEach(function (production) {

                const card = document.createElement("div");
                card.className = "award-card";

                if (production.image_url) {

                    const image = document.createElement("img");
                    image.src = production.image_url;
                    image.alt = production.title;
                    image.style.width = "150px";

                    card.appendChild(image);

                }

                const title = document.createElement("h3");
                title.textContent = production.title;

                const year = document.createElement("p");
                year.textContent = "Year: " + production.year;

                const description = document.createElement("p");
                description.textContent = production.description;

                card.appendChild(title);
                card.appendChild(year);
                card.appendChild(description);

                const deleteButton = document.createElement("button");
                deleteButton.textContent = "Delete";
                deleteButton.className = "delete-award-btn";

                deleteButton.addEventListener("click", async function () {

                    if (!confirm("Are you sure you want to delete this production?")) return;

                    try {

                        const { error } = await supabase
                            .from("productions")
                            .delete()
                            .eq("id", production.id);

                        if (error) throw error;

                        alert("Production deleted successfully!");

                        loadProductions();

                    } catch (error) {

                        console.error(error);
                        alert("Could not delete production.");

                    }

                });

                card.appendChild(deleteButton);
                productionsList.appendChild(card);

            });

        } catch (error) {

            console.error("Productions loading error:", error);
            productionsList.innerHTML = "<p>Unable to load productions.</p>";

        }

    }

    loadProductions();

}

// ===============================
// GALLERY MANAGEMENT
// ===============================

const galleryForm = document.getElementById("gallery-form");
const galleryList = document.getElementById("gallery-list");

if (galleryForm && galleryList) {

    galleryForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const title = document.getElementById("gallery-title").value.trim();
        const imageFile = document.getElementById("gallery-image").files[0];

        try {

            const imageURL = await uploadDashboardImage(imageFile, "gallery");

            const { error } = await supabase
                .from("gallery")
                .insert([{
                    title: title,
                    image_url: imageURL
                }]);

            if (error) throw error;

            alert("Photo added successfully!");

            galleryForm.reset();

            loadGallery();

        } catch (error) {

            console.error("Error adding photo:", error);
            alert("Could not add photo: " + error.message);

        }

    });


    async function loadGallery() {

        try {

            const { data, error } = await supabase
                .from("gallery")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;

            galleryList.innerHTML = "";

            if (!data || data.length === 0) {

                galleryList.innerHTML = "<p>No photos added yet.</p>";
                return;

            }

            data.forEach(function (photo) {

                const card = document.createElement("div");
                card.className = "award-card";

                const image = document.createElement("img");
                image.src = photo.image_url;
                image.alt = photo.title;
                image.style.width = "150px";

                const title = document.createElement("h3");
                title.textContent = photo.title;

                const deleteButton = document.createElement("button");
                deleteButton.textContent = "Delete";
                deleteButton.className = "delete-award-btn";

                deleteButton.addEventListener("click", async function () {

                    if (!confirm("Are you sure you want to delete this photo?")) return;

                    try {

                        const { error } = await supabase
                            .from("gallery")
                            .delete()
                            .eq("id", photo.id);

                        if (error) throw error;

                        alert("Photo deleted successfully!");

                        loadGallery();

                    } catch (error) {

                        console.error("Error deleting photo:", error);
                        alert("Could not delete photo.");

                    }

                });

                card.appendChild(image);
                card.appendChild(title);
                card.appendChild(deleteButton);

                galleryList.appendChild(card);

            });

        } catch (error) {

            console.error("Gallery loading error:", error);
            galleryList.innerHTML = "<p>Unable to load photos.</p>";

        }

    }

    loadGallery();

}
// ===============================
// PROFILE MANAGEMENT
// ===============================

const profileForm = document.getElementById("profile-form");

if (profileForm) {

    const profileName = document.getElementById("profile-name");
    const profileRole = document.getElementById("profile-role");
    const profileDescription = document.getElementById("profile-description");
    const profileImage = document.getElementById("profile-image");

    let profileId = null;
    let currentProfileImageURL = null;


    // Load Existing Profile
    async function loadProfile() {

        try {

            const { data, error } = await supabase
                .from("profile")
                .select("*")
                .limit(1)
                .maybeSingle();

            if (error) throw error;

            if (data) {

                profileId = data.id;

                profileName.value = data.name || "";
                profileRole.value = data.role || "";
                profileDescription.value = data.description || "";

                currentProfileImageURL = data.image_url || null;

            }

        } catch (error) {

            console.error("Error loading profile:", error);

        }

    }

    loadProfile();


    // Save Profile
    profileForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        try {

            const imageFile = profileImage.files[0];

            let imageURL = currentProfileImageURL;

            if (imageFile) {

                imageURL = await uploadDashboardImage(imageFile, "profile");

            }

            const profileData = {
                name: profileName.value.trim(),
                role: profileRole.value.trim(),
                description: profileDescription.value.trim(),
                image_url: imageURL
            };

            let result;

            if (profileId) {

                result = await supabase
                    .from("profile")
                    .update(profileData)
                    .eq("id", profileId);

            } else {

                result = await supabase
                    .from("profile")
                    .insert([profileData])
                    .select()
                    .single();

                if (!result.error) {
                    profileId = result.data.id;
                }

            }

            if (result.error) throw result.error;

            currentProfileImageURL = imageURL;

            alert("Profile saved successfully!");

            profileForm.reset();

        } catch (error) {

            console.error("Profile Error:", error);
            alert("Could not save profile: " + error.message);

        }

    });

}


// ===============================
// VISION MANAGEMENT
// ===============================

const visionForm = document.getElementById("vision-form");

if (visionForm) {

    const visionTitle = document.getElementById("vision-title");
    const visionDescription = document.getElementById("vision-description");

    let visionId = null;


    // Load Existing Vision
    async function loadVision() {

        try {

            const { data, error } = await supabase
                .from("vision")
                .select("*")
                .limit(1)
                .maybeSingle();

            if (error) throw error;

            if (data) {

                visionId = data.id;

                visionTitle.value = data.title || "";
                visionDescription.value = data.description || "";

            }

        } catch (error) {

            console.error("Vision Error:", error);

        }

    }

    loadVision();


    // Save Vision
    visionForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const visionData = {
            title: visionTitle.value.trim(),
            description: visionDescription.value.trim()
        };

        try {

            let result;

            if (visionId) {

                result = await supabase
                    .from("vision")
                    .update(visionData)
                    .eq("id", visionId);

            } else {

                result = await supabase
                    .from("vision")
                    .insert([visionData])
                    .select()
                    .single();

                if (!result.error) {
                    visionId = result.data.id;
                }

            }

            if (result.error) throw result.error;

            alert("Vision saved successfully!");

        } catch (error) {

            console.error("Vision Error:", error);
            alert("Could not save vision.");

        }

    });

}


// ===============================
// MESSAGES MANAGEMENT
// ===============================

const messagesList = document.getElementById("messages-list");

if (messagesList) {

    // Display Messages
    async function loadMessages() {

        try {

            const { data, error } = await supabase
                .from("messages")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;

            messagesList.innerHTML = "";

            if (!data || data.length === 0) {

                messagesList.innerHTML = "<p>No messages received yet.</p>";
                return;

            }

            data.forEach(function (message) {

                const card = document.createElement("div");
                card.className = "award-card";

                const name = document.createElement("h3");
                name.textContent = message.name;

                const email = document.createElement("p");
                email.textContent = "Email: " + message.email;

                const messageText = document.createElement("p");
                messageText.textContent = message.message;

                const date = document.createElement("p");

                if (message.created_at) {

                    date.textContent =
                        "Date: " +
                        new Date(message.created_at).toLocaleString();

                } else {

                    date.textContent = "Date: Not available";

                }

                const deleteButton = document.createElement("button");
                deleteButton.textContent = "Delete Message";
                deleteButton.className = "delete-award-btn";

                deleteButton.addEventListener("click", async function () {

                    const confirmed = confirm(
                        "Are you sure you want to delete this message?"
                    );

                    if (!confirmed) return;

                    try {

                        const { error } = await supabase
                            .from("messages")
                            .delete()
                            .eq("id", message.id);

                        if (error) throw error;

                        loadMessages();

                    } catch (error) {

                        console.error("Error deleting message:", error);
                        alert("Could not delete message.");

                    }

                });

                card.appendChild(name);
                card.appendChild(email);
                card.appendChild(messageText);
                card.appendChild(date);
                card.appendChild(deleteButton);

                messagesList.appendChild(card);

            });

        } catch (error) {

            console.error("Messages loading error:", error);

            messagesList.innerHTML =
                "<p>Unable to load messages.</p>";

        }

    }


    // Load Messages Only After Admin Login
    checkAdminLogin().then((isLoggedIn) => {

        if (isLoggedIn) {
            loadMessages();
        }

    });

}