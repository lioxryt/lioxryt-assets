/*
    BUDDIES are floating, active entities that appear throughout the site.
    At their core, they're just a div with a target and chatterbox that may have a surrounding animation.

    They may be created "globally", which adds them to the global buddy array.
    This means that the page they're assigned to will render them and put them in motion on visit.
    (the array is checked each page load)

    They have an entity, ID (for styling), classes, image to use, and size (equal w/h).
    They have built in functions for easy chatter, as they can be quite talkative!
    They also have events for 'pageEnter' and 'mouseEnter'.

    Their location can be any specific path, or an array of paths.

    
    
    Additionally, they have a behavior - this dictates their movement.
    Planned behaviors: Every xxx ms...
        - Follow - follows the cursor if they're far enough. (Funfriend style)
        - Wander - picks a random spot on the page (extends beyond current scroll)
        - Element - follows a specific element (i.e. follows something else)
        - Element wander - picks spots within a specified element, moving randomly

    
    
*/
class Buddy {
    constructor(settings = {
        element: {
            entity, // examine entity (if any)
            id, //unique ID across entire site (if global), otherwise whatever
            classes, // CSS classes added on creation
            img, // image for the default figure pseudoelement to use
            size, // size for the entity - uses default 75px
            figure, // if the figure should have any contents
            actor //if the element also has a dialogueActor - used in chatter
        },
        activity: {
            behavior: {
                type, //follow, wander, wander_element, element
                rate, //rate at which the buddy repositions
                drift, //pixel amount the element can 'drift' around its target
                limit, //(wander only) pixel amount the element can travel at maximum per tick
                threshold, //(follow only) picks a spot within this pixel range of the element (x and y)
                element, //element gravitating to if wander-element or element
                muiPause, // if true, pauses movement when MUI is open
            },
            events: {
                onRender, //called when created - even before the user has entered the page, but after content has been loaded
                screenEnter, //called when appears visually within window
                pageEnter, //called when user enters the page (i.e. either loads in, or clicks the 'continue' button)
                mouseEnter, //self explanatory
                leaving, //called when leaving page
            }
        },
        location: { //used only if "global", meaning pages should be checking for them
            path, //string or array of paths
            exploredOnly // i.e. won't select a path that hasn't been explored. if none explored, not created
        }
    } = {}) { //constructor start
        //store all critical data
        this.html = `<div id="${settings.element.id}" 
        class="buddy ${settings.element.classes ? settings.element.classes : ""}" 
        style="
            ${settings.element.img ? `--buddyimg: url(${settings.element.img});` : ""}
            ${settings.element.size ? `--size: ${settings.element.size};` : ""}
            --speed: ${settings.activity.behavior.speed ? settings.activity.behavior.speed : "1000" }ms;
        ">
        
            <div class="chatter-container"></div>
            ${settings.element.entity ? `<div class="target" entity="${settings.element.entity}"></div>` : ``}
            <figure>${settings.element.figure ? settings.element.figure : ""}</figure>

        </div>`
        this.elementData = settings.element
        this.activityData = settings.activity

        //determine globalness, where it should be if so
        if(typeof settings.location != 'undefined') {
            if(Buddy.globalBuddies.find(buddy => buddy.id == settings.element.id)) throw 'buddy exists'

            this.global = true
            this.locationData = settings.location
            Buddy.globalBuddies.push(this)

            this.setNewLocation()
            if(!this.shouldBeOnPage()) { //we don't want to continue with render if its not on this page
                return this
            }
        }

        //continue with render
        this.render()
        return this        
    }

    /* PUBLIC - everything to do with the individual buddy */
    // NEWLOCATION - rerolls buddy location from list of specified paths, used by globals only
    // can also specify a specific one
    setNewLocation = (specificLocation) => {
        if(typeof this.locationData == "undefined" || this.global == false) return false

        //specific set
        if(specificLocation) {
            this.currentLocation = specificLocation
            return this.currentLocation
        }

        //resets to original path - may not use, but didn't want to leave a gap in coverage
        if(typeof this.locationData.path == "string") {
            this.currentLocation = this.locationData.path
            return this.currentLocation
        }

        //otherwise, using locationData.path array
        switch(this.locationData.exploredOnly) {
            case true: //we can reference detectedEntities for pages the user has been to
                let visitedAreas = []
                for (const areaName in flags.detectedEntities) {
                    const area = flags.detectedEntities[areaName];
                    visitedAreas.push(area.path)
                }

                const possibleAreas = visitedAreas.filter(area => this.locationData.path.includes(area));
                let selectedArea
                if(possibleAreas.length) {
                    selectedArea = possibleAreas.sample()
                    this.currentLocation = selectedArea
                    return this.currentLocation
                } else {
                    throw 'no possible areas'
                }

            case false:
                this.currentLocation = this.locationData.path.sample()
                return this.currentLocation
        }
    }

    //what it sounds like - returns true if they should show on this page, otherwise false
    shouldBeOnPage = () => {
        if(location.pathname == this.currentLocation) return true;
        else return false
    }

    // RENDER - creates the buddy within the current page's context
    render = () => {
        content.insertAdjacentHTML('beforeEnd', this.html)
        this.el = content.querySelector(`#${this.elementData.id}`)
        console.log('buddy', this.el)

        //constructor events
        try {
            if(typeof this.activityData.events.onRender == "function") setTimeout(()=>{
                this.activityData.events.onRender()
                this.el.classList.add('instant')
                setTimeout(()=>this.el.classList.remove('instant'), 50)
            }, 10)

            if(typeof this.activityData.events.mouseEnter == "function") this.el.addEventListener('mouseenter', this.activityData.events.mouseEnter)
        } catch(e) { /* no events specified */ }

        Buddy.currentPageBuddies.push(this)
        this.activateObserver()
        this.xy = {x: 0, y: 0}
        setTimeout(this.activateBehavior, 20)
    }

    /* BEHAVIORS - movement around the page, events, etc */
    behaviorTimeout = null // created/cleared on page enter/leave
    behaving = false
    paused = false
    clearBehavior = () => {
        clearTimeout(this.behaviorTimeout)
        this.behaviorTimeout = null
        this.behaving = false
    }

    //behavior is checked and acted upon every 200ms
    //behavior can change, (i.e. being set from follow to element)!
    activateBehavior = () => {
        if(this.behaviorTimeout || this.behaving) throw 'already behaving'
        this.behaving = true
        this.runBehavior() //do initial one too
    }

    runBehavior = () => {
        clearTimeout(this.behaviorTimeout)
        this.behaviorTimeout = setTimeout(this.runBehavior, this.activityData.behavior.rate || 1000)

        if(typeof this.activityData.behavior.muiPause == 'undefined' || this.activityData.behavior.muiPause === true ) 
            if(body.classList.contains('in-menu') || body.classList.contains('mui-active')) return 
        if(this.paused) return

        let behavior = this.activityData.behavior
        switch(behavior.type) {
            case "follow": this.behavior_follow(); break
            case "wander": this.behavior_wander(); break
        }
    }

    //shortcuts for updating travel rate/anim speed
    changeRate = (rate) => { this.activityData.behavior.rate = rate }
    changeSpeed = (speed) => { this.el.style.setProperty('--speed', `${speed}ms`) }

    //used by mouse follow
    behavior_follow = () => { //if the position of the buddy is further than its threshold, move it within its threshold
        let buddyEl = this.el
        let behavior = this.activityData.behavior
        if(buddyEl == null) this.clearBehavior()

        let buddyPosition = buddyEl.getBoundingClientRect()
        let newPosition = {x: 0, y: 0}

        let desiredX = env.pageCursor.x
        let desiredY = env.pageCursor.y

        let threshold = behavior.threshold ? behavior.threshold : 150 //default 150 px

        if(behavior.element) { // we want it to follow the element instead, assuming center for now - use drift for organicness
            let elPos = behavior.element.getBoundingClientRect()
            desiredX = elPos.x + window.scrollX + elPos.width / 2
            desiredY = elPos.y + window.scrollY + elPos.height / 2
        }

        let contentPosition = content.getBoundingClientRect() // since buddies are within the content, they need to be offset the same
        desiredX = (desiredX - contentPosition.x) + window.pageXOffset

        let drift = behavior.drift || 0
        let randX = ((Math.random() * drift) - drift * 0.5)
        if(buddyPosition.left < (desiredX - threshold)) newPosition.x = desiredX - threshold + randX
        else if(buddyPosition.right > (desiredX + threshold + buddyPosition.width)) newPosition.x = desiredX + threshold + buddyPosition.width + randX
        else newPosition.x = this.xy.x + randX

        let randY = ((Math.random() * drift) - drift * 0.5)
        if(buddyPosition.top + window.scrollY > (desiredY + threshold)) newPosition.y = desiredY + threshold + randY
        else if(buddyPosition.bottom + window.scrollY < (desiredY - threshold - + buddyPosition.height)) newPosition.y = desiredY - threshold - buddyPosition.height + randY
        else newPosition.y = this.xy.y + randY

        this.setPosition(newPosition)
    }

    //gets a random position in the page - beware on large pages, may be hard to track!
    //ignores MUI being open - not concerned about player
    behavior_wander = () => {
        let buddyEl = this.el
        let behavior = this.activityData.behavior
        if(buddyEl == null) this.clearBehavior()
        
        let buddyPosition = buddyEl.getBoundingClientRect()
        let newPosition = {x: 0, y: 0}
        let targetEl
        let targetDimensions

        if(behavior.element) {
            targetEl = behavior.element
            targetDimensions = behavior.element.getBoundingClientRect()
        } else {
            targetEl = content
            targetDimensions = content.getBoundingClientRect();
        }

        if(behavior.limit) { //limited - will go in pixel increments across the page, but not beyond boundaries
            //limit only works with page-level wander - wandering with a limit within arbitrary elements while also accounting for whether it's the content element is a pain soo i shelfed that for now.
            //maybe u code crawlers could write the math better than i can >:) hmu

            //get current position of the element (based on top-left point)
            var currentX = buddyPosition.left + window.pageXOffset;
            var currentY = buddyPosition.top + window.pageYOffset;

            //calculate maximum distance the element can move in each direction
            var maxX = Math.clamp(currentX + behavior.limit, currentX, targetEl.offsetWidth - this.el.offsetWidth) - currentX;
            var maxY = Math.clamp(currentY + behavior.limit, currentY, targetEl.offsetHeight - this.el.offsetHeight) - currentY;
            var minX = Math.clamp(currentX - behavior.limit, 0, currentX) - currentX;
            var minY = Math.clamp(currentY - behavior.limit, 0, currentY) - currentY;       

            //generate random offset within the maximum distances
            var offsetX = Math.random() * (maxX - minX) + minX;
            var offsetY = Math.random() * (maxY - minY) + minY;

            //calculate new position within container bounds and container position
            newPosition.x = Math.clamp(currentX + offsetX, 0, targetEl.offsetWidth - this.el.offsetWidth);
            newPosition.y = Math.clamp(currentY + offsetY, 0, targetEl.offsetHeight - this.el.offsetHeight);

        } else { //unlimited - good luck catching this freak on content level! but in a specified element, it's not so bad
            if(targetEl != content) {
                newPosition.x = rand(targetDimensions.x + window.scrollX, targetDimensions.x + window.scrollX + targetDimensions.width)
                newPosition.y = rand(targetDimensions.y + window.scrollY, targetDimensions.y + window.scrollY + targetDimensions.height)
            } else {
                newPosition.x = rand(buddyPosition.width, targetDimensions.width - buddyPosition.width)
                newPosition.y = rand(buddyPosition.height, targetDimensions.height - buddyPosition.height)                
            }
        }

        let contentPosition = content.getBoundingClientRect() // since buddies are within the content, they need to be offset the same
        newPosition.x = (newPosition.x - contentPosition.x) - window.pageXOffset

        this.setPosition(newPosition)
    }

    setPosition = (xy = {x: null, y: null}) => {
        let buddyEl = this.el
        if(buddyEl == null) return

        if(xy.x !== null) { buddyEl.style.setProperty('--offsetX', xy.x); this.xy.x = xy.x }
        if(xy.y !== null) { buddyEl.style.setProperty('--offsetY', xy.y); this.xy.y = xy.y }
    }

    /* EVENT METHODS */
    // intersection observer tracks whether the buddy element is visible or not
    // if they are, we activate the event (if there is one)
    observer = null
    activateObserver = () => {
        if(typeof this.activityData.events != "object") return
        if(typeof this.activityData.events.screenEnter != "function") return
        if(!this.el) throw 'no element to observe'
        this.observer = new IntersectionObserver(entries => {
            if(body.getAttribute("state") == "corru-loaded") return //dont chatter if they aren't actually in
            let entry = entries[0]  
            if(entry.isIntersecting) {
                setTimeout(()=> this.activityData.events.screenEnter(), 1000)
            }
        }, {threshold: 0.75}); //when 75% is visible

        this.observer.observe(this.el)
    }

    deactivateObserver = () => {
        try{
            this.observer.unobserve(this.el)
        } catch(e) { /* this is fine just means no el or no observer */ }
        this.observer = null
    }

    /* CHATTER - a shortcut to corru.js chatter for this buddy*/
    chatter = ({text, duration = 6000, log = true, readout = false})=>{
        console.log(this, this.el)
        if(!this.elementData.actor) throw 'no actor specified for buddy'
        if(typeof this.el != 'object') throw 'no element on page to chatter'
        chatter({actor: this.elementData.actor, text: text, duration: duration, log: log, readout: readout, customEl: this.el})
    }

    /* HANDY TIMING FUNCTIONS */
    timeouts = []
    setTimeout = (func, time) => {
        let newTimeout = setTimeout(func, time)
        env.timeouts.push(newTimeout)
        return newTimeout
    }

    clearTimeouts = ()=>{
        env.timeouts.forEach(timeout => {
            clearTimeout(timeout)
        });
    }
		
    intervals = []
    setInterval = (func, time) => {
        let newInterval = setInterval(func, time)
        env.intervals.push(newInterval)
        return newInterval
    }

    clearIntervals = ()=>{
        env.intervals.forEach(interval => {
            clearInterval(interval)
        });
    }

    /* STATIC - for tracking, checking if anything needs to be rendered on present page, etc. */
    static globalBuddies = []
    static currentPageBuddies = []

    // checks to see if any global buddies should be at the present page path
    // if they do, add the buddy to the content
    static renderGlobalBuddies = () => {
        this.globalBuddies.forEach(buddy=>{
            if(buddy.shouldBeOnPage() && !buddy.el) {
                buddy.render()
                Buddy.currentPageBuddies.push(buddy)
            }
        })
    }

    //triggers the 'on page load' event of all buddies
    static triggerPageBuddies = () => {
        this.currentPageBuddies.forEach(buddy=>{
            try{ 
                if(typeof buddy.activityData.events.pageEnter == "function") buddy.activityData.events.pageEnter()
            } catch(e) { /* no events specified */ }
        })
    }

    //deconstructs all buddies on current page - global or local
    //intended for use on page leave
    static cleanPageBuddies = ({removeEl} = {removeEl: true}) => {
        Buddy.currentPageBuddies.forEach(buddy=>{
            if(buddy.el != null) {
                if(removeEl) buddy.el.remove()
                if(typeof buddy.activityData.events != "undefined") buddy.el.removeEventListener('mouseenter', buddy.activityData.events.mouseEnter)
                buddy.el = null
            }

            buddy.deactivateObserver()
            buddy.clearBehavior()
            buddy.clearTimeouts()
            buddy.clearIntervals()

            //trigger removal callback after cleanup
            if(typeof buddy.activityData.events != "undefined") if(typeof buddy.activityData.events.leaving == "function") buddy.activityData.events.leaving()
        })
        
        Buddy.currentPageBuddies = []
    }
}

/* GLOBAL BUDDIES */
/* these need to be set up an instant after bootup or else they fail*/
setTimeout(()=>{
    try {
        //proxies only show up after repairs have begun
        if(check("ep1_fed")) env.buddy_ffproxy = new Buddy({
            element: {
                entity: "proxyfriend",
                id: "ffproxy",
                actor: "proxyfriend",
                size: "98px",
                img: "/img/sprites/funfriend/proxyfriend.gif",
                classes: "ffproxy",
            },

            activity: {
                behavior: {type: 'wander', drift: 50, rate: 5000, speed: 3000},
                events: {
                    screenEnter: ()=> {
                        change("seenFFProxy", true)
                    },
                    mouseEnter: ()=> {
                        if(check('PAGE!!proxint')) return
                        setTimeout(()=>env.buddy_ffproxy.chatter({text: "HELLO INTERLOPER"}), 750)
                        change('PAGE!!proxint', true)
                    },
                    onRender: ()=>{
                        let patches = content.querySelectorAll('.repairpatch-drift')
                        if(patches.length) {
                            let patchOfChoice = [... patches].sample()
                            patchOfChoice.classList.add('active')
                            env.buddy_ffproxy.activityData.behavior.element = patchOfChoice

                            patchOfChoice.querySelector(".repairpatch").insertAdjacentHTML('beforeend', `<div class="target" entity="membrane incision"></div>`)
                        } else { //drifting around, taking it easy
                            env.buddy_ffproxy.activityData.behavior.rate = 20000
                            env.buddy_ffproxy.activityData.behavior.speed = 5000
                        }
                    }
                }
            },

            location: {
                path: ["/local/city/", "/local/orbit/", "/local/ocean/"],
                exploredOnly: true
            }
        })
    } catch(e) { console.log('friendification failed', e) }
}, 1000)