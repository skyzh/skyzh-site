import { useState, useEffect } from 'react'

interface Reaction {
    name: string;
    emoji_1: number;
    emoji_2: number;
    emoji_3: number;
    emoji_4: number;
    emoji_5: number;
    emoji_6: number;
    emoji_7: number;
    emoji_8: number;
}

function OneReaction({ slug, id, emoji, count }: { slug: string, id: string, emoji: string; count: number }) {
    const [clicked, setClicked] = useState<number>(0)
    const updateReaction = () => {
        setClicked(clicked + 1)
        let req = { name: slug }
        req[id] = count
        fetch(`/api/reactions/add`, {
            method: "POST",
            body: JSON.stringify(req)
        }).then()
    }
    return <button style={{ "marginRight": "1em" }} onClick={updateReaction}>{emoji} {(count || 0) + clicked}</button>
}

function Reactions({ slug, reaction }: { slug: string, reaction: Reaction }) {
    return <div>
        <OneReaction slug={slug} id="emoji_1" emoji="❤️" count={reaction.emoji_1} />
        <OneReaction slug={slug} id="emoji_2" emoji="👍" count={reaction.emoji_2} />
        <OneReaction slug={slug} id="emoji_3" emoji="😅" count={reaction.emoji_3} />
        <OneReaction slug={slug} id="emoji_4" emoji="💩" count={reaction.emoji_4} />
        <small>Reactions powered by <a href="https://neon.tech/" target="_blank">Neon</a></small>
    </div>
}

export default function ({ slug }: { slug: string }) {
    const [reaction, setReaction] = useState<Reaction | null>(null)
    useEffect(() => {
        fetch(`/api/reactions/get/?slug=${slug}`)
            .then(res => res.json())
            .then(setReaction)
    }, [])
    return reaction ? <Reactions slug={slug} reaction={reaction} /> : <div></div>
}
