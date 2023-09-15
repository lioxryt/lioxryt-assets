/* New genericized VN system for embassy dialogues and possibly more

- There shouldn't be a concept of "main" or "side" character, but instead just individual character divs
    all centered and similarly sized. full sprites as well so they can be scaled as needed to represent distance

- Max-width and transitions can determine focus - characters have a wrapper that can overlap, spread, etc
    - max-width is a % based on the number of showing (non-party) characters 

- the sprites aren't all there at all times, instead they're added/removed as needed (need to keep library)
    - since max-width is cascading and DOM based, should be able to add in from left or right (left by default)

- simplify classes, aside from specials
    - 'focus' only one person can have this, removes from others
        - scales and centers them - may move others aside (all nonparty get a transform left or right based on pos, maxwidth reduct)
    
    - 'hide' or 'show' - simple as that
        - show adds them to the page after transitions
        - hide removes them from the page after transitions

- the first two party members past akizet get a special class ('vn-party') to place them at the edges
    - party members will shift out from the edges on dialogue start
*/

class VN {
    constructor() {
        //there should only ever be one on the page
        if(document.querySelector('#vn')) throw 'already got a VN dummy'

        content.insertAdjacentHTML("beforeend",`<div id="vn" version="2"></div>`)
        this.el = content.querySelector('#vn')

        this.charList = []
        this.activeChars = 0
        this.el.style.setProperty("--activeChars", this.activeChars)
        this.addTimestopperConnectors = true

        //so we can just use "vn" and "vnp" as a shortcut in execs - keep it readable
        //there should only ever be one anyway
        window.vn = this
        window.vnp = (inp) => this.pos(inp)
    }

    //VN element toggles and shortcuts
    toggle(className, setting) {
        if(setting == null) this.el.classList.toggle(className)
        else this.el.classList.toggle(className, setting)
    }

    bg = (setting = null) => this.toggle('bg', setting) //adds the dither bg
    fade = (setting = null) => this.toggle('fade', setting) //adds the dither bg
    fadeChars = (setting = null) => this.toggle('fade-chars', setting) //adds the dither bg

    //culls the stage and activates BG, animating smoothly so it isn't noticeable
    hideStage = (setting = null, bg = false) => {
        content.classList.add('show-vn') //in case it's not already here
        
        this.bg(bg)
        content.classList.toggle('fade-stage', setting)
    }

    //shortcut for closing a dialogue
    done() {
        this.hideStage(false, false)
        this.charList.forEach(charEl => {
            this.set(charEl.char, 'hide')
        })
    }

    //character additions and controls
    /* 
        "set" is used to control the wrapper of a character and is not a VN1 equivalent (see 'pos' below)
        the wrapper is used to animate characters in/out of the VN scene and control their order kinda
        possible settings:
            show / showleft / showright
                adds + animates in a new character to the VN layer on the specified side
                defaults to left if unspecified

            hide
                animates out + removes the character from the VN layer

            focus
                increases max-width 
                decreases max-width and opacity of other active characters
                only one person can have this at a time, will remove from others

            (arbitrary): this function can be used to toggle anything on the wrapper (it'll just prepend "vn-"). any specific ones below:
                absolute: makes this wrapper absolutely centered. useful for temp characters who are super position transform-based (i.e. tutorial golem)
    
        value is only used for non-hide/show to determine removal or addition
        if unset, it'll toggle stuff
    */
    set(char, inputSetting, value) {
        let wrapperQuery = `.vn-wrapper[for="${char}"]:not(.vn-party)`
        let charEl = this.el.querySelector(wrapperQuery)

        if(!VN.chars[char]) throw 'char doesnt exist in library'
        console.log('inputSetting', inputSetting, inputSetting.startsWith('show'))
        if(!charEl && !inputSetting.includes('show')) { console.warn("character hasnt been shown yet"); return } 
        
        if(!charEl && inputSetting.includes("show")) { //add da guy
            //determine if they need a timestopper connector
            let addConnector = false
            if(page.party && this.addTimestopperConnectors) if(page.party.slice(0, 3).some(mem => mem.slug === char)) {
                addConnector = true
            }
            let newEl = `<div class="vn-wrapper ${addConnector ? "vn-con" : ""}" for="${char}">${VN.chars[char]}</div>`

            switch(inputSetting.replace('show', '')) {
                case "left":
                    this.el.insertAdjacentHTML('afterbegin', newEl)
                    charEl = this.el.querySelector(wrapperQuery)
                    this.charList.unshift(charEl)
                break

                case "right": default:
                    this.el.insertAdjacentHTML('beforeend', newEl)
                    charEl = this.el.querySelector(wrapperQuery)
                    this.charList.push(charEl)
            }
            charEl.char = char

            this.activeChars += 1
            setTimeout(()=>charEl.classList.add('active'), 150) //runtime delay
            this.el.style.setProperty("--activeChars", this.activeChars)
            return charEl
    
        } else if(charEl && inputSetting == "hide") { //remove da guy
            console.log('in hide')
            try {
                charEl = this.charList.find(charEl => charEl.char == char)
                if(!charEl) return //probably already got removed somehow

                this.charList = this.charList.filter(charEl => charEl.char != char)
                this.activeChars -= 1
                this.el.style.setProperty("--activeChars", this.activeChars)

                charEl.classList.remove('active')
                charEl.classList.add('hiding')
                setTimeout(()=>{charEl.remove()}, 1500)
                return charEl
            } catch(e) { console.log(e) }
        }

        //for all other non-managerial settings
        let setting = "vn-" + inputSetting

        switch(setting) {
            case "vn-focus": //only one person can have focus at a time since it affects all others
                charEl = this.charList.find(charEl => charEl.char == char)

                if(charEl) if(value === false) {
                    this.toggle('focused', false)
                    charEl.classList.remove('.vn-focus')
                } else {
                    this.el.querySelectorAll('.vn-focus').forEach(el=>el.classList.remove('vn-focus'))
                    charEl.classList.add('vn-focus')
                    this.toggle('focused', true)
                }
            break

            default: //special wrapper control 
                if(value == null) charEl.classList.add(setting)
                else charEl.classList.toggle(setting, value)
        }

        return charEl
    }

    //separate from the classes for a vn-char is its "pos" (position) setting
    //these are used in CSS to determine base transforms
    //this works like VN1, where updating a character's position is overwriting it
    //you can bulk update, too
    /* 
        {
            bg: (true/false), (shortcut)
            fade: (true/false), (shortcut)
            (charactername): (position to set),
            (charactername): (position to set),
            ...
        }
    */
    //setting show or hide will trigger a set() on the character
    //if you're gonna show or hide someone, it should always be first
    pos(settings) {
        for (const prop in settings) {
            const setting = settings[prop]

            console.log('got', settings)
            //shortcuts
            if(prop == "bg") this.bg(setting)
            else if(prop == "fade") this.fade(setting)
            else if(prop == "hideStage") {this.hideStage(setting, true)}
            
            //otherwise it's a character setting
            //if a character is specified, we overwrite their position attribute
            else {
                let split = setting.split(" ");

                //some handy shortcuts
                ["show", 'showleft', 'showright', "hide", "focus", "wait"].forEach(special=>{
                    if(!split.includes(special)) {
                        if(special == "focus") this.set(prop, special, false) //remove focus if unspecified
                        if(special == "wait") this.set(prop, special, false) //ditto for wait

                        return
                    }

                    this.set(prop, special)
                    setting.replace(special, "")
                })

                //handle weird positions
                split.forEach(position => {
                    if(position == "abs") this.set(prop, 'absolute')
                    if(position == "unabs") this.set(prop, 'absolute', false)
                })
                
                switch(setting) {
                    case "r": //historically this was just "" in VN1 but i want to reserve "" for just resetting position now
                        this.set(prop, 'hide')

                    default:
                        let charEl = this.charList.find(charEl => charEl.char == prop)
                        if(charEl) setTimeout(()=>charEl.setAttribute('pos', setting), 50)
                }
            }
        }
    }

    //creates special vn-chars for the current active party members
    //this only looks at the first two after akizet
    //these vn-chars exist outside of the regular system and move out of the way during dialogues
    renderParty() {
        let members = page.party.slice(1, 3)
        this.el.querySelectorAll('.vn-party').forEach(el=>el.remove())

        let memberString = ""
        members.forEach(member=>{
            let char = member.slug
            memberString += `${member.slug} `
            this.el.insertAdjacentHTML('beforeend',`<div class="vn-wrapper vn-party vn-con active" for="${char}">${VN.chars[char]}</div>`)
        })
        content.setAttribute('party', memberString)
    }

    //char library
    static chars = {
        gakvu: `
            <div id="gakvu" class="vn-char vn-qou">
                <div class="head"></div> <div class="body"></div>
                <span class="target" entity="gakvu"></span>
            </div>
        `,

        tozik:`
            <div id="tozik" class="vn-char vn-qou">
                <div class="head"></div> <div class="body"></div>
                <span class="target" entity="tozik"></span>
            </div>
        `,

        miltza:`
                <div id="miltza" class="vn-char vn-qou">
                    <div class="head"></div> <div class="body"></div> <div class="arms"></div>
                    <span class="target" entity="miltza"></span>
                </div>
        `,

        bozko:`
                <div id="bozko" class="vn-char vn-qou">
                    <div class="head"></div> <div class="body"></div> <div class="arms"></div>
                    <span class="target" entity="bozko"></span>
                </div>
        `,

        kazki:`
                <div id="kazki" class="vn-char vn-qou">
                    <div class="head"></div> <div class="body"></div> <div class="legs"></div>
                    <span class="target" entity="kazki"></span>
                </div>
        `,

        cavik:`
                <div id="cavik" class="vn-char vn-qou">
                    <div class="head"></div> <div class="body"></div> <div class="arms"></div> <div class="legs"></div>
                    <span class="target" entity="cavik"></span>
                </div>
        `,

        itzil:`
            <div id="itzil" class="vn-char vn-mindcore"></div>
        `,

        itzilBusted:`
            <div id="itzilBusted" class="vn-char vn-mindcore"></div>
        `,

        karik:`
            <div id="karik" class="vn-char vn-mindcore"></div>
        `,

        ikgolem:`
                <div id="ikgolem" class="vn-char vn-qou">
                    <div class="head"></div> <div class="body"></div> <div class="arms"></div>
                    <span class="target" entity="ik golem"></span>
                </div>
        `,

        //oneoffs/specials
        bstrdface: `
            <div id="bstrdface" class="vn-char vn-side"></div>
        `,

        tgolem:`
            <div id="tgolem" class="vn-char golemchar">
                <div class="sprite-wrapper golemsprite">
                    <img src="/img/sprites/combat/foes/golem.gif" class="sprite golemsprite-base">
                    <div class="sprite golemsprite-head">
                        <img src="/img/sprites/combat/foes/golem-head.gif">
                    </div>
                    <img src="/img/sprites/combat/foes/golem-neck.gif" class="sprite golemsprite-neck">
                    <img src="/img/sprites/combat/foes/golem-body.gif" class="sprite golemsprite-body">
                    <img src="/img/sprites/combat/foes/golem-leftarm.gif" class="sprite golemsprite-leftarm">
                    <img src="/img/sprites/combat/foes/golem-rightarm.gif" class="sprite golemsprite-rightarm">
                </div>
            </div>
        `,

        agolem:`
            <div id="agolem" class="vn-char golemchar">
                <div class="sprite-wrapper golemsprite">
                    <div class="sprite-overflow spritestack">
                        <img src="/img/sprites/combat/foes/archivalgolem.gif" class="sprite golemsprite-base">
                        <div class="sprite golemsprite-head">
                            <img src="/img/sprites/combat/foes/archivalgolem-head.gif">
                        </div>
                        <img src="/img/sprites/combat/foes/archivalgolem-body.gif" class="sprite golemsprite-body">
                        <img src="/img/sprites/combat/foes/archivalgolem-arms.gif" class="sprite golemsprite-arms">
                    </div>
                </div>
            </div>
        `,

        geli: `
            <div id="geli" class="vn-char vn-qou vn-geli">
                <div class="head"></div> 
                <div class="body"></div>
            </div>
        `,

        husk1:`
            <div id="husk1" class="vn-char vn-qou" style="--charTransform: translateY(-10%)">
                <div class="sprite-wrapper husk generated" type="1" t="1" b="1">
                    <div class="spritestack">
                        <img src="/img/sprites/combat/foes/husks/type1_bottom1.gif" class="sprite basis">
                        <div class="sprite toplayer" style="animation-delay: -2s"></div>
                        <div class="sprite bottomlayer" style="animation-delay: -3s"></div>
                    </div>
                    <div class="target" entity="husk"></div>
                </div>
            </div>
        `,

        husk2:`
            <div id="husk1" class="vn-char vn-qou" style="--charTransform: translateY(-10%)">
                <div class="sprite-wrapper husk generated" type="2" t="2" b="1">
                    <div class="spritestack">
                        <img src="/img/sprites/combat/foes/husks/type2_bottom2.gif" class="sprite basis">
                        <div class="sprite toplayer" style="animation-delay: -4s"></div>
                        <div class="sprite bottomlayer" style="animation-delay: -6s"></div>
                    </div>
                    <div class="target" entity="husk"></div>
                </div>
            </div>
        `,

        kivii:`
            <div id="kivii" class="vn-char vn-qou">
                <div class="sprite-wrapper kivii" id="%SLUG-sprite-wrapper">
                    <div class="sprite-overflow spritestack">
                        <img class="sprite" src="/img/sprites/combat/foes/kivii/combat.gif" id="%SLUG-sprite">
                        <div class="sprite swap"></div>
                    </div>
                </div>
            </div>
        `,
    }
}