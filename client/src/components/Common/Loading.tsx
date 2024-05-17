import React from 'react'
import ReactLoading from 'react-loading';

type Props = {}

function Loading(props: Props) {
    return (
        <div className="overlay" >
            <ReactLoading type={'bubbles'} color={"#007bff"} height={667} width={375} />
        </div >
    )
}

export default Loading