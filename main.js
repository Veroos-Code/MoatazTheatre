import { supabase } from "./supabase.js";

// ===============================
// PUBLIC AWARDS
// ===============================

const awardsContainer = document.getElementById("public-awards-container");

if (awardsContainer) {

    async function loadAwards() {

        try {

            const { data, error } = await supabase
                .from("awards")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;

            awardsContainer.innerHTML = "";

            if (!data || data.length === 0) {
                awardsContainer.innerHTML = "<p>No awards available yet.</p>";
                return;
            }

            data.forEach((award) => {

                const awardCard = document.createElement("div");
                awardCard.className = "award-card";

                if (award.image_url) {

                    const image = document.createElement("img");
                    image.src = award.image_url;
                    image.alt = award.title;
                    image.className = "award-image";

                    awardCard.appendChild(image);

                } else {

                    const icon = document.createElement("div");
                    icon.className = "award-icon";
                    icon.textContent = "✦";

                    awardCard.appendChild(icon);

                }

                const title = document.createElement("h3");
                title.textContent = award.title;

                const description = document.createElement("p");
                description.textContent = award.description;

                const year = document.createElement("span");
                year.className = "award-year";
                year.textContent = award.year;

                awardCard.appendChild(title);
                awardCard.appendChild(description);
                awardCard.appendChild(year);

                awardsContainer.appendChild(awardCard);

            });

        } catch (error) {

            console.error("Error loading awards:", error);
            awardsContainer.innerHTML = "<p>Unable to load awards.</p>";

        }

    }

    loadAwards();

}


// ===============================
// PUBLIC PRODUCTIONS
// ===============================

const productionsContainer = document.getElementById("public-productions-container");

if (productionsContainer) {

    async function loadProductions() {

        try {

            const { data, error } = await supabase
                .from("productions")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;

            productionsContainer.innerHTML = "";

            if (!data || data.length === 0) {
                productionsContainer.innerHTML = "<p>No productions available yet.</p>";
                return;
            }

            data.forEach((production) => {

                const productionCard = document.createElement("div");
                productionCard.className = "production-card";

                const productionImage = document.createElement("img");
                productionImage.className = "production-image";
                productionImage.src = production.image_url || "";
                productionImage.alt = production.title;

                if (!production.image_url) {
                    productionImage.style.display = "none";
                }

                const title = document.createElement("h3");
                title.textContent = production.title;

                const description = document.createElement("p");
                description.textContent = production.description;

                const year = document.createElement("span");
                year.className = "production-year";
                year.textContent = production.year;

                productionCard.appendChild(productionImage);
                productionCard.appendChild(title);
                productionCard.appendChild(description);
                productionCard.appendChild(year);

                productionsContainer.appendChild(productionCard);

            });

        } catch (error) {

            console.error("Error loading productions:", error);
            productionsContainer.innerHTML = "<p>Unable to load productions.</p>";

        }

    }

    loadProductions();

}


// ===============================
// PUBLIC GALLERY
// ===============================

const publicGalleryContainer = document.getElementById("public-gallery-container");

if (publicGalleryContainer) {

    async function loadGallery() {

        try {

            const { data, error } = await supabase
                .from("gallery")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;

            publicGalleryContainer.innerHTML = "";

            if (!data || data.length === 0) {
                publicGalleryContainer.innerHTML = "<p>No photos available yet.</p>";
                return;
            }

            data.forEach((photo) => {

                const galleryCard = document.createElement("div");
                galleryCard.className = "gallery-card";

                const image = document.createElement("img");
                image.src = photo.image_url || "";
                image.alt = photo.title;

                const title = document.createElement("h3");
                title.textContent = photo.title;

                galleryCard.appendChild(image);
                galleryCard.appendChild(title);

                publicGalleryContainer.appendChild(galleryCard);

            });

        } catch (error) {

            console.error("Error loading gallery:", error);
            publicGalleryContainer.innerHTML = "<p>Unable to load photos.</p>";

        }

    }

    loadGallery();

}


// ===============================
// PUBLIC PROFILE
// ===============================

async function loadProfile() {

    try {

        const { data: profile, error } = await supabase
            .from("profile")
            .select("*")
            .limit(1)
            .maybeSingle();

        if (error) throw error;

        if (!profile) return;

        // Update Home
        const publicName = document.getElementById("public-profile-name");
        const publicRole = document.getElementById("public-profile-role");

        if (publicName) {
            publicName.textContent = profile.name || "MOATAZ MEDHAT";
        }

        if (publicRole) {
            publicRole.textContent = profile.role || "THEATRE DIRECTOR";
        }

        // Update About
        const aboutName = document.getElementById("public-about-name");
        const aboutDescription = document.getElementById("public-profile-description");
        const aboutImage = document.getElementById("public-profile-image");

        if (aboutName) {
            aboutName.textContent = "About " + (profile.name || "Moataz Medhat");
        }

        if (aboutDescription) {
            aboutDescription.textContent = profile.description || "";
        }

        if (aboutImage) {

            if (profile.image_url) {
                aboutImage.src = profile.image_url;
                aboutImage.style.display = "block";
            } else {
                aboutImage.style.display = "none";
            }

        }

    } catch (error) {

        console.error("Error loading profile:", error);

    }

}

loadProfile();


// ===============================
// PUBLIC VISION
// ===============================

async function loadVision() {

    try {

        const { data: vision, error } = await supabase
            .from("vision")
            .select("*")
            .limit(1)
            .maybeSingle();

        if (error) throw error;

        if (!vision) return;

        const visionTitle = document.getElementById("public-vision-title");
        const visionDescription = document.getElementById("public-vision-description");

        if (visionTitle) {
            visionTitle.textContent = vision.title || "My Vision";
        }

        if (visionDescription) {
            visionDescription.textContent = vision.description || "";
        }

    } catch (error) {

        console.error("Error loading vision:", error);

    }

}

loadVision();


// ===============================
// CONTACT FORM
// ===============================

const contactForm = document.getElementById("contact-form");

if (contactForm) {

    contactForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const name = document.getElementById("contact-name").value.trim();
        const email = document.getElementById("contact-email").value.trim();
        const message = document.getElementById("contact-message").value.trim();

        const status = document.getElementById("contact-status");
        const submitButton = contactForm.querySelector("button");

        if (!name || !email || !message) {
            status.textContent = "Please fill in all fields.";
            return;
        }

        submitButton.disabled = true;
        status.textContent = "Sending your message...";

        try {

            const { error } = await supabase
                .from("messages")
                .insert([{
                    name: name,
                    email: email,
                    message: message
                }]);

            if (error) throw error;

            status.textContent = "Your message has been sent successfully!";

            contactForm.reset();

        } catch (error) {

            console.error("Error sending message:", error);

            status.textContent = "Something went wrong. Please try again.";

        } finally {

            submitButton.disabled = false;

        }

    });

}