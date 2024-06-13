import React from 'react'
import ReactLoading from 'react-loading';

type Props = {}

function Loading(props: Props) {
    return (
        <div className="overlay" >
            <ReactLoading type={'spin'} color={"#007bff"} height={140} width={140} />
        </div >
    )
}

export default Loading