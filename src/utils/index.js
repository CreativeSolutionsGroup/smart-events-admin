export const COLOR_CEDARVILLE_YELLOW = "#F3A00F";
export const COLOR_CEDARVILLE_BLUE = "#31B7E6";
export const API_URL = "https://api.cusmartevents.com" //"http://localhost:3001"

export const clientId =
  '787844068457-38ubcdtp9moimvtq3a1du037nphmo8ee.apps.googleusercontent.com';


export const refreshTokenSetup = (res) => {
    
    let email = res.profileObj.email;
    
    checkUserList(email).then((response) => {
        if(response){
            console.log('Login Success: currentUser:', res.profileObj);
            alert(
            `Logged in successfully welcome ${res.profileObj.email}`
            );
    
                    // Timing to renew access token
            let refreshTiming = (res.tokenObj.expires_in || 3600 - 5 * 60) * 1000;

            const refreshToken = async () => {
                const newAuthRes = await res.reloadAuthResponse();
                refreshTiming = (newAuthRes.expires_in || 3600 - 5 * 60) * 1000;
                console.log('newAuthRes:', newAuthRes);
                // saveUserToken(newAuthRes.access_token);  <-- save new token
                localStorage.setItem('authToken', newAuthRes.id_token);
                // Setup the other timer after the first one
                setTimeout(refreshToken, refreshTiming);
            };
             // Setup first refresh timer
            setTimeout(refreshToken, refreshTiming);
            localStorage.setItem('authToken', res.getAuthResponse().id_token);
            localStorage.setItem('email', email);
            window.open('/dashboard', "_self");
        } else {
            localStorage.removeItem('authToken');
            localStorage.removeItem('email');
            console.log('Login Failed: currentUser:', res.profileObj);
            alert(
            `Logged in failed. ${res.profileObj.email} is not an allowed user`
            );
        }
    })
};

export const isLogin = () => {
    if (localStorage.getItem('authToken')) {
        return true;
    }

    return false;
}

export const isLive = (obj) =>
{
  return isTimeLive(obj.start_time, obj.end_time)
}

export const isTimeLive = (start_time, end_time) =>
{
  let time = new Date();
  return new Date(start_time) <= time && time <= new Date(end_time)
}

export const authorizedFetch = (url) => {
    if(!localStorage.getItem('authToken')){
        return {status: 'error', message: 'No user is logged in'};
    }
    let token = localStorage.getItem('authToken');
    let authHeader = {Authorization: "Bearer " + token}
    return fetch(url, {headers: authHeader});
}

export const authorizedPost = (axios, url, data) => {
    if(!localStorage.getItem('authToken')){
        return {status: 'error', message: 'No user is logged in'};
    }
    let token = localStorage.getItem('authToken');
    let authHeader = {Authorization: "Bearer " + token}
    return axios.post(url, data, {headers: authHeader});
}

export const authorizedPut = (axios, url, data) => {
    if(!localStorage.getItem('authToken')){
        return {status: 'error', message: 'No user is logged in'};
    }
    let token = localStorage.getItem('authToken');
    let authHeader = {Authorization: "Bearer " + token}
    return axios.put(url, data, {headers: authHeader});
}

export const authorizedDelete = (axios, url) => {
    if(!localStorage.getItem('authToken')){
        return {status: 'error', message: 'No user is logged in'};
    }
    let token = localStorage.getItem('authToken');
    return axios.delete(url, {headers: {Authorization: "Bearer " + token}});
}

export const getEvents = () => {
    return authorizedFetch(API_URL + '/api/events/')
        .then((res) => res.json())
        .then(
            (res) => {
                if (res.status !== "success") {
                    console.log("Failed to retrieve Events");
                    console.log(res.message);
                    alert("Error (Events): " + res.message);
                    return []
                }
                return res.data;
            },
            (err) => {
                console.error("Failed to retrieve Events");
                console.error(err);
                return []
            }
        );
}

export const getEvent = (eventId) => {
    return authorizedFetch(API_URL + '/api/events/' + eventId)
        .then((res) => res.json())
        .then(
            (res) => {
                if (res.status !== "success") {
                    console.log("Failed to retrieve Event");
                    console.log(res.message);
                    alert("Error (Event): " + res.message);
                    return "";
                }
                return res.data;
            },
            (err) => {
                console.error("Failed to retrieve Event");
                console.error(err);
                return "";
            }
        );
}

export const getAllEngagements = () => {
    return authorizedFetch(API_URL + '/api/engagements/')
        .then((res) => res.json())
        .then(
            (res) => {
                if (res.status !== "success") {
                    console.log("Failed to retrieve Engagements");
                    console.log(res.message);
                    alert("Error (Engagements): " + res.message);
                    return [];
                }
                return res.data;
            },
            (err) => {
                console.error("Failed to retrieve Engagements");
                console.error(err);
                return [];
            }
        );
}

export const getEventEngagements = (eventId) => {
    return authorizedFetch(API_URL + '/api/engagements/')
        .then((res) => res.json())
        .then(
            (res) => {
                if (res.status !== "success") {
                    console.log("Failed to retrieve Engagements");
                    console.log(res.message);
                    alert("Error (Engagements): " + res.message);
                    return [];
                }
                let filteredEngagements = [];
                res.data.forEach(element => {
                    if (element.event_id === eventId) {
                        filteredEngagements.push(element);
                    }
                });
                return filteredEngagements;
            },
            (err) => {
                console.error("Failed to retrieve Engagements");
                console.error(err);
                return [];
            }
        );
}

export const getEngagementEngagees = (engagementId) => {
    return authorizedFetch(API_URL + '/api/engagements/' + engagementId + "/engagees")
        .then((res) => res.json())
        .then(
            (res) => {
                if (res.status !== "success") {
                    console.log("Failed to retrieve Engagement Engagees");
                    console.log(res.message);
                    alert("Error (Engagees): " + res.message);
                    return [];
                }
                return res.data;
            },
            (err) => {
                console.error("Failed to retrieve Engagement Engagees");
                console.error(err);
                return [];
            }
        );
}

export const getAllEngageesCount = () => {
    return authorizedFetch(API_URL + '/api/engagees/')
        .then((res) => res.json())
        .then(
            (res) => {
                if (res.status !== "success") {
                    console.log("Failed to retrieve Engagees");
                    console.log(res.message);
                    alert("Error (Engagees): " + res.message);
                    return {};
                }

                let filteredEngagees = {};
                res.data.forEach(engagee => {
                   let oldCount = 0;
                    if (filteredEngagees[engagee.engagement_id] != null) {
                        oldCount = filteredEngagees[engagee.engagement_id];
                    }
                    filteredEngagees[engagee.engagement_id] = oldCount + 1;
                });
                return filteredEngagees;
            },
            (err) => {
                console.error("Failed to retrieve Engagees");
                console.error(err);
                return {};
            }
        );
}

export const getEngagementEngageeCounts = (engagements) => {
    let filteredEngagees = {};
    engagements.forEach((engagement) => {
        getEngagementEngagees(engagement._id)
        .then((response) => {
            filteredEngagees[engagement._id] = response.length;
        })
    })
    return filteredEngagees;
}

export const getGoogleSheetJSON = (sheetId) => {
    return fetch('https://docs.google.com/spreadsheets/d/' + sheetId + '/gviz/tq?tqx=out:json')
    .then(res => res.text())
    .then(text => {
        const json = JSON.parse(text.substr(47).slice(0, -2))
        return json.table;
    })
}

export const getPermissionList = () => {
    return getGoogleSheetJSON("16z9qXFdq9nr56WH323vJ16ty2VFJqKMEWfy6JMnlCXc")
    .then((json) => {
        let rows = json.rows;
        let size = rows.length;
        let values = rows.slice(1, size);

        let permissionsList = [];
        values.forEach((row) => {
            let email = row.c[0].v;
            let permissions = row.c[1].v;
            permissionsList.push({email: email, permissions: permissions})
        })
        return permissionsList;
    })
}

export const getUserPermissions = async (email) => {
    return getPermissionList()
    .then((response) => {
        let permissions = [];
        response.forEach((user) => {
            if(user.email === email){
                permissions= user.permissions;
            }
        })
        return permissions;
    });
}

export const checkUserList = async (email) => {
    return getPermissionList()
    .then((response) => {
        let hasEmail = false;
        response.forEach((user) => {
            if(user.email === email){
                hasEmail = true;
            }
        })
        return hasEmail;
    });
}

export const formatTime = (time) => {
    let d = new Date(time);
    let hours = d.getHours();
    let minutes = ('0' + d.getMinutes()).slice(-2);
    let TOD;
    if (hours === 0) {
        hours = 12;
        TOD = "AM";
    } else if (hours === 12) {
        TOD = "PM";
    } else if (hours > 12) {
        hours = hours - 12;
        TOD = "PM";
    } else {
        TOD = "AM"
    }
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()} ${hours}:${minutes} ${TOD}`;
}

//Attractions
export const getAttractions = () => {
    return fetch(API_URL + '/api/attractions/')
        .then((res) => res.json())
        .then(
            (res) => {
                if (res.status !== "success") {
                    console.log("Failed to retrieve Attractions");
                    console.log(res.message);
                    alert("Error (Attractions): " + res.message);
                    return [];
                }
                return res.data;
            },
            (err) => {
                console.error("Failed to retrieve Attractions");
                console.error(err);
                return [];
            }
        );
}

export const getAllSlots = () => {
    return fetch(API_URL + '/api/slots/')
        .then((res) => res.json())
        .then(
            (res) => {
                if (res.status !== "success") {
                    console.log("Failed to retrieve Slots");
                    console.log(res.message);
                    alert("Error (Slots): " + res.message);
                    return [];
                }
                return res.data;
            },
            (err) => {
                console.error("Failed to retrieve Slots");
                console.error(err);
                return [];
            }
        );
}

export const getAttractionSlots = (attractionId) => {
    return fetch(API_URL + '/api/slots/')
        .then((res) => res.json())
        .then(
            (res) => {
                if (res.status !== "success") {
                    console.log("Failed to retrieve Slots");
                    console.log(res.message);
                    alert("Error (Slots): " + res.message);
                    return [];
                }
                let filteredSlots = [];
                res.data.forEach(element => {
                    if (element.attraction_id === attractionId) {
                        filteredSlots.push(element);
                    }
                });
                return filteredSlots;
            },
            (err) => {
                console.error("Failed to retrieve Slots");
                console.error(err);
                return [];
            }
        );
}

export const getSlotTickets = (slotId) => {
    return fetch(API_URL + '/api/slots/' + slotId + "/tickets")
        .then((res) => res.json())
        .then(
            (res) => {
                if (res.status !== "success") {
                    console.log("Failed to retrieve Tickets");
                    console.log(res.message);
                    alert("Error (Tickets): " + res.message);
                    return [];
                }
                return res.data;
            },
            (err) => {
                console.error("Failed to retrieve Tickets");
                console.error(err);
                return [];
            }
        );
}

export const getAllAttractionCapacities = async (attractions) => {
    let slots = await getAllSlots();
    return attractions.map(async (attraction) => {
        let attractionSlots = await slots.filter(slot => slot.attraction_id === attraction._id);
        if(attractionSlots.length === 0) {
            return [attraction._id, "-"];
        } else {
            let values = await Promise.all(attractionSlots.map(async (slot) => {
                let tickets = await getSlotTickets(slot._id);
                let capacity = slot.ticket_capacity;
                let used = tickets.length;
                return {count: used, capacity: capacity};   
            }));
            
            let used_capacity = 0;
            let total_capacity = 0;

            values.forEach((value) => {
                used_capacity+= value.count;
                total_capacity+= value.capacity;
            })

            if (total_capacity !== 0) {
                let percent = parseFloat((1 - used_capacity / total_capacity) * 100).toFixed(1) + "%";
                return [attraction._id, percent];
            } else {
                return [attraction._id, "-"];
            }
        }
    });
}