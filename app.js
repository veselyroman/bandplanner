let users =
    JSON.parse(
        localStorage.getItem(
            "bandplanner_users"
        )
    ) || [

        {
            username: "Roman",
            password: "1234",
            role: "admin"
        },

        {
            username: "Pepa",
            password: "1234",
            role: "member"
        },

        {
            username: "Jarda",
            password: "1234",
            role: "member"
        },

        {
            username: "Karel",
            password: "1234",
            role: "member"
        }

    ];

let currentUser = null;

let currentUserRole = null;

let proposals =
    JSON.parse(
        localStorage.getItem("bandplanner_proposals")
    ) || [];

/* ===========================
   ULOŽENÍ DAT
=========================== */

function saveData() {

    localStorage.setItem(
        "bandplanner_proposals",
        JSON.stringify(proposals)
    );

    localStorage.setItem(
        "bandplanner_users",
        JSON.stringify(users)
    );
}

/* ===========================
   KONTROLA PŘIHLÁŠENÍ
=========================== */

function requireLogin() {

    if (!currentUser) {

        alert("Nejste přihlášen.");

        return false;
    }

    return true;
}

/* ===========================
   LOGIN
=========================== */

async function login() {

    const username =
        document.getElementById("username").value.trim();

    const password =
        document.getElementById("password").value;

const user =
    await firebaseLogin(
        username,
        password
    );

    if (!user) {

        alert("Neplatné přihlášení");

        return;
    }

    currentUser = user.username;

    currentUserRole = user.role;

    document.getElementById("loginScreen").style.display =
        "none";

    document.getElementById("appScreen").style.display =
        "block";

    document.getElementById("currentUser").innerText =
        currentUser;

    document.getElementById("currentRole").innerText =
	    currentUserRole;

	if (currentUserRole === "admin") {

	    document.getElementById(
	        "usersTab"
	    ).style.display = "inline-block";

	}

    showSection("mine");

    refreshLists();
}

/* ===========================
   LOGOUT
=========================== */

function logout() {

    currentUser = null;

    currentUserRole = null;

	document.getElementById(
	    "usersTab"
	).style.display = "none";

    showSection("mine");

    document.getElementById("loginScreen").style.display =
        "block";

    document.getElementById("appScreen").style.display =
        "none";
}

/* ===========================
   SEKCE
=========================== */

function showSection(section) {

    document.getElementById("mineSection").style.display =
        "none";

    document.getElementById("othersSection").style.display =
        "none";

    document.getElementById("authorSection").style.display =
        "none";

    document.getElementById("calendarSection").style.display =
	"none";

	document.getElementById("usersSection")
	    .style.display = "none";

    document.getElementById("newSection").style.display =
        "none";

	document.getElementById("profileSection").style.display = "none";

    if (section === "mine") {

        document.getElementById("mineSection").style.display =
            "block";
    }

    if (section === "others") {

        document.getElementById("othersSection").style.display =
            "block";
    }

    if (section === "author") {

        document.getElementById("authorSection").style.display =
            "block";
    }

    if (section === "calendar") {

	    document.getElementById("calendarSection").style.display =
            "block";
    }

	if (section === "profile") {
	    document.getElementById(
	        "profileSection"
	    ).style.display = "block";

	    refreshProfile();
	}

	if (section === "users") {

	    document.getElementById(
	        "usersSection"
	    ).style.display = "block";

	    refreshUsers();
	}

    if (section === "new") {

        document.getElementById("newSection").style.display =
            "block";
    }
}

/* ===========================
   NOVÝ NÁVRH
=========================== */

function updateEndTime() {

    const type =
        document.getElementById(
            "eventType"
        ).value;

    const startTime =
        document.getElementById(
            "eventStartTime"
        ).value;

    if (!startTime) {
        return;
    }

    const parts =
        startTime.split(":");

    let hours =
        parseInt(parts[0], 10);

    const minutes =
        parseInt(parts[1], 10);

let durationHours = 2;

if (type === "Zkouška") {
    durationHours = 2;
}

if (type === "Koncert") {
    durationHours = 5;
}

hours += durationHours;

    if (hours >= 24) {
        hours -= 24;
    }

    const endTime =
        String(hours)
            .padStart(2, "0")
        + ":"
        + String(minutes)
            .padStart(2, "0");

    document.getElementById(
        "eventEndTime"
    ).value = endTime;
}

function createProposal() {

    if (!requireLogin()) return;

    const type =
        document.getElementById("eventType").value;

    const date =
        document.getElementById("eventDate").value;

	const startTime =
	    document.getElementById(
	        "eventStartTime"
	    ).value;

	const endTime =
	    document.getElementById(
	        "eventEndTime"
	    ).value;

    const location =
        document.getElementById("eventLocation").value.trim();

    const note =
        document.getElementById("eventNote").value.trim();

if (
    !date ||
    !startTime ||
    !endTime ||
    !location
) {
    alert("Vyplň datum, čas a místo.");
    return;
}

if (startTime >= endTime) {
    alert(
        "Čas konce musí být později než čas začátku."
    );
    return;
}

	const duplicate = proposals.find(p =>

	    p.status !== "cancelled" &&

	    p.type === type &&
	    p.date === date &&
	p.startTime === startTime &&
	p.endTime === endTime &&
	    p.location === location

	);

	if (duplicate) {

	    alert(
	        "Taková akce již existuje."
	    );

	    return;
	}

	const proposal = {
	    id: Date.now(),
	    type,
	    date,
	    startTime,
	    endTime,
	    location,
	    note,
	    createdBy: currentUser,
	    status: "pending",

	    approved: [currentUser],

	    rejected: [],

	    participants: [],

	    pendingUsers:
	        users
	            .map(u => u.username)
	            .filter(
	                u => u !== currentUser
	            )
	};
    proposals.push(proposal);

    saveData();

    document.getElementById("eventDate").value = "";
	document.getElementById("eventStartTime").value = "";
	document.getElementById("eventEndTime").value = "";
    document.getElementById("eventLocation").value = "";
    document.getElementById("eventNote").value = "";

    alert("Návrh vytvořen");

    refreshLists();
}

/* ===========================
   KONTROLA HLASOVÁNÍ
=========================== */

function processVoting(proposal) {

	if (
	    proposal.pendingUsers &&
	    proposal.pendingUsers.length > 0
	) {
	    return;
	}

	    if (proposal.rejected.length === 0) {

	        proposal.status = "approved";

	        proposal.participants =
	            [...proposal.approved];

	        return;
	    }

    proposal.status = "waiting_for_author";
}

/* ===========================
   SCHVÁLENÍ
=========================== */

function approve(id) {

    if (!requireLogin()) return;

    const proposal =
        proposals.find(p => p.id === id);

    if (!proposal) return;

    if (
        proposal.approved.includes(currentUser) ||
        proposal.rejected.includes(currentUser)
    ) {
        return;
    }

    proposal.approved.push(currentUser);

	if (proposal.pendingUsers) {

	    proposal.pendingUsers =
	        proposal.pendingUsers.filter(
	            u => u !== currentUser
	        );
	}

    processVoting(proposal);

    saveData();

    refreshLists();
}

/* ===========================
   ZAMÍTNUTÍ
=========================== */

function reject(id) {

    if (!requireLogin()) return;

    const proposal =
        proposals.find(p => p.id === id);

    if (!proposal) return;

    if (
        proposal.approved.includes(currentUser) ||
        proposal.rejected.includes(currentUser)
    ) {
        return;
    }

    proposal.rejected.push(currentUser);

	if (proposal.pendingUsers) {

	    proposal.pendingUsers =
	        proposal.pendingUsers.filter(
	            u => u !== currentUser
	        );
	}

    processVoting(proposal);

    saveData();

    refreshLists();
}

/* ===========================
   POTVRDIT I TAK
=========================== */

function confirmAnyway(id) {

    if (!requireLogin()) return;

    const proposal =
        proposals.find(p => p.id === id);

    if (!proposal) return;

    if (proposal.createdBy !== currentUser) {

        alert(
            "Pouze autor návrhu může potvrdit termín."
        );

        return;
    }

    proposal.status = "approved";

    proposal.participants =
        [...proposal.approved];

    saveData();

    refreshLists();
}

/* ===========================
   ZRUŠIT NÁVRH
=========================== */

function cancelProposal(id) {

    if (!requireLogin()) return;

    const proposal =
        proposals.find(p => p.id === id);

    if (!proposal) return;

    if (proposal.createdBy !== currentUser) {

        alert(
            "Pouze autor návrhu může zrušit návrh."
        );

        return;
    }

    proposal.status = "cancelled";

    saveData();

    refreshLists();
}

/* ===========================
   NAKONEC DORAZÍM
=========================== */
function attendAnyway(id) {

    if (!requireLogin()) return;

    const proposal =
        proposals.find(p => p.id === id);

    if (!proposal) return;

    if (!proposal.rejected.includes(currentUser)) {
        return;
    }

    proposal.rejected =
        proposal.rejected.filter(
            u => u !== currentUser
        );

    if (!proposal.approved.includes(currentUser)) {
        proposal.approved.push(currentUser);
    }

    if (!proposal.participants.includes(currentUser)) {
        proposal.participants.push(currentUser);
    }

    if (!proposal.messages) {
        proposal.messages = [];
    }

    proposal.messages.push({
        date: new Date().toISOString(),
        text:
            currentUser +
            " nakonec dorazí."
    });

    saveData();
    refreshLists();

    alert(
        "Autor akce byl informován, že nakonec dorazíš."
    );
}

/* ===========================
   NAKONEC NEDORAZÍM
=========================== */
function cannotAttendAnyway(id) {

    if (!requireLogin()) return;

    const proposal =
        proposals.find(
            p => p.id === id
        );

    if (!proposal) return;

    if (
        !proposal.participants.includes(
            currentUser
        )
    ) {
        return;
    }

    const now = new Date();

    const eventDate =
        new Date(
            `${proposal.date}T${proposal.startTime}`
        );

    const diffDays =
        (eventDate - now) /
        (1000 * 60 * 60 * 24);

    if (
        proposal.type === "Koncert" &&
        diffDays < 30
    ) {

        alert(
            "Účast na koncertu lze změnit nejpozději 30 dní před akcí."
        );

        return;
    }

    if (
        proposal.type === "Zkouška" &&
        diffDays < 1
    ) {

        alert(
            "Účast na zkoušce lze změnit nejpozději 1 den před akcí."
        );

        return;
    }

    proposal.participants =
        proposal.participants.filter(
            u => u !== currentUser
        );

    proposal.approved =
        proposal.approved.filter(
            u => u !== currentUser
        );

    if (
        !proposal.rejected.includes(
            currentUser
        )
    ) {

        proposal.rejected.push(
            currentUser
        );
    }

    if (!proposal.messages) {

        proposal.messages = [];
    }

    proposal.messages.push({

        date:
            new Date().toISOString(),

        text:
            currentUser +
            " nakonec nedorazí."

    });

    saveData();
    refreshLists();

    alert(
        "Autor akce byl informován."
    );
}

/* ===========================
   POTVRZENÍ NOTIFIKACE
=========================== */
function acknowledgeNotification(
    proposalId,
    notificationIndex
) {

    if (!requireLogin()) return;

    const proposal =
        proposals.find(
            p => p.id === proposalId
        );

    if (!proposal) return;

    if (
        proposal.createdBy !== currentUser
    ) {
        return;
    }

    if (
        !proposal.messages ||
        !proposal.messages[notificationIndex]
    ) {
        return;
    }

    proposal.messages.splice(
        notificationIndex,
        1
    );

    saveData();
    refreshLists();
}

/* ===========================
   SMAZAT AKCI
=========================== */
function deleteEvent(id) {

    if (!requireLogin()) return;

    if (currentUserRole !== "admin") {

        alert(
            "Mazat akce může pouze administrátor."
        );

        return;
    }

    const proposal =
        proposals.find(
            p => p.id === id
        );

    if (!proposal) return;

    const confirmed = confirm(
        "Opravdu chceš akci odstranit?"
    );

    if (!confirmed) return;

    proposals =
        proposals.filter(
            p => p.id !== id
        );

    saveData();
    refreshLists();

    alert("Akce byla odstraněna.");
}

/* ===========================
   UŽIVATELÉ
=========================== */

function refreshUsers() {

    const list =
        document.getElementById(
            "usersList"
        );

    list.innerHTML = "";

    users.forEach(user => {

	list.innerHTML += `
	    <div class="proposal">

	        <b>${user.username}</b>

	        (${user.role})

	        <br><br>

	        <button
	            class="reject"
	            onclick="
	                deleteUser(
	                    '${user.username}'
	                )
	            ">
	            Smazat
	        </button>

		<button
		    class="approve"
		    onclick="
		        toggleUserRole(
		            '${user.username}'
		        )
		    ">

		    ${user.role === "admin"
		        ? "Nastavit jako člena"
		        : "Nastavit jako admina"}

		</button>

	    </div>
	`;
    });
}

function showAddUserForm() {

    document.getElementById(
        "addUserForm"
    ).style.display = "block";
}

function addUser() {

    const username =
        document.getElementById(
            "newUsername"
        ).value.trim();

    const password =
        document.getElementById(
            "newPassword"
        ).value.trim();

    const role =
        document.getElementById(
            "newRole"
        ).value;

    if (!username || !password) {

        alert(
            "Vyplň uživatelské jméno a heslo."
        );

        return;
    }

    const exists =
        users.find(
            u => u.username === username
        );

    if (exists) {

        alert(
            "Uživatel již existuje."
        );

        return;
    }

    users.push({

        username,
        password,
        role

    });

const today = new Date();

proposals.forEach(p => {

    const eventDate =
        new Date(
            `${p.date}T${p.startTime}`
        );

    if (eventDate < today) {
        return;
    }

    if (!p.pendingUsers) {
        p.pendingUsers = [];
    }

    if (
        !p.pendingUsers.includes(username) &&
        !p.approved.includes(username) &&
        !p.rejected.includes(username)
    ) {

        p.pendingUsers.push(username);
    }

});


	saveData();

	refreshUsers();

	refreshLists();

    document.getElementById(
        "addUserForm"
    ).style.display = "none";

    alert(
        "Uživatel vytvořen."
    );
}

/* ===========================
   SMAZAT UŽIVATELE
=========================== */
function deleteUser(username) {

    if (!requireLogin()) return;

    if (currentUserRole !== "admin") {
        return;
    }

    if (username === currentUser) {

        alert(
            "Nemůžeš smazat sám sebe."
        );

        return;
    }

    const confirmed = confirm(
        "Opravdu chceš odstranit uživatele " +
        username +
        "?"
    );

    if (!confirmed) return;

    const index =
        users.findIndex(
            u => u.username === username
        );

    if (index === -1) return;

    users.splice(index, 1);

proposals.forEach(p => {

    p.approved =
        p.approved.filter(
            u => u !== username
        );

    p.rejected =
        p.rejected.filter(
            u => u !== username
        );

    p.participants =
        p.participants.filter(
            u => u !== username
        );

    if (p.pendingUsers) {
        p.pendingUsers =
            p.pendingUsers.filter(
                u => u !== username
            );
    }
});

	saveData();

    refreshUsers();
refreshLists();
    alert(
        "Uživatel odstraněn."
    );
}

/* ===========================
   ZMĚNIT ROLI
=========================== */
function toggleUserRole(username) {

    if (!requireLogin()) return;

    if (currentUserRole !== "admin") {
        return;
    }

    const user =
        users.find(
            u => u.username === username
        );

    if (!user) return;

    if (user.username === currentUser) {

        alert(
            "Nelze měnit vlastní roli."
        );

        return;
    }

    user.role =
        user.role === "admin"
            ? "member"
            : "admin";

    saveData();
    refreshUsers();

    alert(
        "Role byla změněna."
    );
}

function refreshProfile() {

    const info =
        document.getElementById(
            "profileInfo"
        );

    info.innerHTML =
        `
        <b>${currentUser}</b>
        <br>
        Role:
        ${
            currentUserRole === "admin"
                ? "Administrátor"
                : "Člen"
        }
        `;
}

function changePassword() {

    if (!requireLogin()) return;

    const password1 =
        document.getElementById(
            "newPassword1"
        ).value;

    const password2 =
        document.getElementById(
            "newPassword2"
       ).value;

    if (!password1) {

        alert(
            "Zadej nové heslo."
        );

        return;
    }

    if (password1 !== password2) {

        alert(
           "Hesla se neshodují."
       );

        return;
    }

    const user =
        users.find(
           u =>
                u.username === currentUser
        );

   if (!user) {
        return;
   }

    user.password = password1;
    saveData();

    document.getElementById(
        "newPassword1"
   ).value = "";

    document.getElementById(
        "newPassword2"    ).value = "";

    alert(
       "Heslo bylo změněno."
    );
}


/* ===========================
   OBNOVENÍ SEZNAMŮ
=========================== */

function downloadCalendarEvent(id) {

    const proposal =
        proposals.find(
            p => p.id === id
        );

    if (!proposal) {
        return;
    }

    const start =
        proposal.date.replaceAll("-", "") +
        "T" +
        proposal.startTime.replace(":", "") +
        "00";

    const end =
        proposal.date.replaceAll("-", "") +
        "T" +
        proposal.endTime.replace(":", "") +
        "00";

    const content =
`BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:Kapela - ${proposal.type}
DTSTART:${start}
DTEND:${end}
LOCATION:${proposal.location}
DESCRIPTION:${proposal.note || ""}
END:VEVENT
END:VCALENDAR`;

    const blob =
        new Blob(
            [content],
            {
                type:
                    "text/calendar"
            }
        );

    const url =
        URL.createObjectURL(blob);

    const a =
        document.createElement("a");

    a.href = url;

    a.download =
        `${proposal.type}-${proposal.date}.ics`;

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);

    URL.revokeObjectURL(url);
let exportedEvents =
    JSON.parse(
        localStorage.getItem(
            "bandplanner_calendar_exports"
        )
    ) || {};

if (!exportedEvents[currentUser]) {
    exportedEvents[currentUser] = [];
}

if (
    !exportedEvents[currentUser].includes(id)
) {
    exportedEvents[currentUser].push(id);
}

localStorage.setItem(
    "bandplanner_calendar_exports",
    JSON.stringify(exportedEvents)
);
refreshLists();

}

function refreshTabNotifications() {

    let mineCount = 0;
    let authorCount = 0;

    proposals.forEach(p => {

        const voted =
            p.approved.includes(currentUser) ||
            p.rejected.includes(currentUser);

        if (
            (
                p.status === "pending" ||
                (
                    p.status === "approved" &&
                    p.pendingUsers &&
                    p.pendingUsers.includes(
                        currentUser
                    )
                )
            ) &&
            !voted &&
            p.createdBy !== currentUser
        ) {
            mineCount++;
        }

        if (
            p.status === "waiting_for_author" &&
            p.createdBy === currentUser
        ) {
            authorCount++;
        }
    });

    document.getElementById(
        "mineTab"
    ).innerText =
        mineCount > 0
            ? "🔴 Čeká na moje vyjádření"
            : "Čeká na moje vyjádření";

    document.getElementById(
        "authorTab"
    ).innerText =
        authorCount > 0
            ? "🔴 Čeká na rozhodnutí autora"
            : "Čeká na rozhodnutí autora";
}

function refreshLists() {

    const mineList =
        document.getElementById("mineList");

    const othersList =
        document.getElementById("othersList");

    const authorList =
	    document.getElementById("authorList");

const exportedEvents =
    JSON.parse(
        localStorage.getItem(
            "bandplanner_calendar_exports"
        )
    ) || {};

    const calendarList =
	    document.getElementById("calendarList");

	mineList.innerHTML = "";
	othersList.innerHTML = "";
	authorList.innerHTML = "";
	calendarList.innerHTML = "";

[...proposals]

    .sort((a, b) => {

        const dateA =
            new Date(`${a.date}T${a.startTime}`);

        const dateB =
            new Date(`${b.date}T${b.startTime}`);

        return dateA - dateB;

    })

    .forEach(p => {

        if (p.status === "cancelled") {

            return;
        }

        const voted =

            p.approved.includes(currentUser) ||

            p.rejected.includes(currentUser);

        /* ======================
           ČEKÁ NA MOJE VYJÁDŘENÍ
        ====================== */

 if (

    (
        p.status === "pending"

        ||

        (
            p.status === "approved" &&
            p.pendingUsers &&
            p.pendingUsers.includes(currentUser)
        )

    )

    &&

    !voted

    &&

    p.createdBy !== currentUser
)
 {

            mineList.innerHTML += `
            <div class="proposal">

                <b>${p.type}</b><br>

		${p.date}<br>
		${p.startTime} - ${p.endTime}<br>
                ${p.location}<br>
		${p.note}<br><br>
                <button
                    class="approve"
                    onclick="approve(${p.id})">

                    Schválit

                </button>

                <button
                    class="reject"
                    onclick="reject(${p.id})">

                    Zamítnout

                </button>

            </div>
            `;
        }

        /* ======================
           ČEKÁ NA OSTATNÍ
        ====================== */

        if (

            p.status === "pending" &&

            (voted || p.createdBy === currentUser)

        ) {

	 const waiting =
	    p.pendingUsers || [];

 const votedCount =
    users.length -
    waiting.length;

            othersList.innerHTML += `
            <div class="proposal">

                <b>${p.type}</b><br>

		${p.date}<br>
		${p.startTime} - ${p.endTime}<br>
                ${p.location}<br>
		${p.note}<br><br>
                <div class="waiting">

                    ${votedCount}/${users.length}
                    vyjádřeno

                    <br><br>

                    Čeká na:

                    ${waiting.join(", ") || "nikoho"}

                </div>

            </div>
            `;
        }

        /* ======================
           ROZHODNUTÍ AUTORA
        ====================== */

        if (

            p.status === "waiting_for_author" &&

            p.createdBy === currentUser

        ) {

            authorList.innerHTML += `
            <div class="proposal">

                <b>${p.type}</b><br>

		${p.date}<br>
		${p.startTime} - ${p.endTime}<br>
                ${p.location}<br><br>

                <b>Souhlasili:</b><br>

                ${p.approved.join(", ")}

                <br><br>

                <b>Nesouhlasili:</b><br>

                ${p.rejected.join(", ")}

                <br><br>

                <button
                    class="approve"
                    onclick="confirmAnyway(${p.id})">

                    Potvrdit i tak

                </button>

                <button
                    class="reject"
                    onclick="cancelProposal(${p.id})">

                    Zrušit návrh

                </button>

		${currentUserRole === "admin"
		    ? `
		        <button
		            class="cancel-final"
		            onclick="deleteEvent(${p.id})">
		            Smazat
		        </button>
		      `
		    : ""
		}

            </div>
            `;
        }
 
       /* ======================
           KALENDÁŘ
        ====================== */

if (p.status === "approved") {

    const now =
        new Date();

    const eventEnd =
        new Date(
            `${p.date}T${p.endTime}`
        );

    if (eventEnd < now) {
        return;
    }

	let messagesHtml = "";

		if (
	    p.createdBy === currentUser &&
	    p.messages &&
	    p.messages.length
	) {

		messagesHtml =
		    "<br><div class='info'><b>Nové informace:</b><br><br>";

			p.messages.forEach((m, index) => {

			    messagesHtml += `

			        ${m.text}

			        <br>

			        <button
			            onclick="
			                acknowledgeNotification(
			                    ${p.id},
			                    ${index}
			                )
			            ">
			            Potvrzuji, že jsem četl
			        </button>

			        <br><br>

			    `;

			});

			messagesHtml += "</div>";	}

            const color =
                p.type === "Koncert"
                    ? "#2e7d32"
                    : "#1565c0";

	    const icon =
		    p.type === "Koncert"
		        ? "🎤"
		        : "🎵";

            calendarList.innerHTML += `
                <div class="proposal"
                     style="border-left:5px solid ${color}">
                     
		    <b>${icon} ${p.type}</b><br>

		    <span style="
			    font-size:18px;
			    font-weight:bold;
		    ">
			    ${p.date}
		    </span>
		    <br>

		    ${p.startTime} - ${p.endTime}<br>

                    ${p.location}<br>

                    ${p.note ? `<br>${p.note}<br>` : ""}

		    ${p.rejected.includes(currentUser)
			    ? `
			        <div class="info">
 			           ⚠ Avizoval jsi, že nedorazíš.
 			           <br><br>
  			          <button
  			             class="approve"
   			             onclick="attendAnyway(${p.id})">
			             Nakonec dorazím
 			          </button>
 			       </div>
			      `
			    : ""
		}

		${messagesHtml}

		${currentUserRole === "admin"
		    ? `
		        <br>

		        <button
		            class="reject"
		            onclick="deleteEvent(${p.id})">
		            Smazat akci
		        </button>
	
		        <br><br>
      			`
		    : ""
		}

<br>

${
    exportedEvents[currentUser] &&
    exportedEvents[currentUser].includes(p.id)
        ? `
            <div class="info">
                ✅ Zřejmě jsi si už přidal do kalendáře.
            </div>
          `
        : `
            <button
                class="approve"
                onclick="downloadCalendarEvent(${p.id})">
                📅 Přidat do kalendáře
            </button>
          `
}
<br><br>

		<div class="participants">

		    <b>Zúčastní se:</b><br>

		    ${p.participants.join(", ") || "-"}

		${(() => {
	
		    if (!p.participants.includes(currentUser)) {
		        return "";
		    }

		    const now = new Date();

		    const eventDate =
		        new Date(
		            `${p.date}T${p.startTime}`
		        );

		    const diffDays =
		        (eventDate - now) /
		        (1000 * 60 * 60 * 24);

		    const canCancel =
		        (p.type === "Koncert" && diffDays >= 30) ||
		        (p.type === "Zkouška" && diffDays >= 1);

		    if (!canCancel) {
		        return "";
		    }

		    return `
		        <br><br>

		        <button
		            class="reject"
		            onclick="
		                cannotAttendAnyway(
		                    ${p.id}
		                )
		            ">
		            Nakonec nedorazím
		        </button>
		    `;

		})()}
		</div>
                </div>
            `;
        }

    });
	refreshTabNotifications();
}