import "./App.css"
import {useState} from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Tree from "./pages/tree/Tree";
import Home from "./pages/home/Home";
import {getCSSVariable} from "./utils/util";
import OSD from "./pages/osd/OSD";

export default function App() {
    const [title, setTitle] = useState('');
    return (
        <div>
            <h1 style={{
                height: getCSSVariable('--header-height'),
            }}>{title}</h1>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home setTitle={setTitle}/>}/>
                    <Route path="/tree" element={<Tree setTitle={setTitle}/>} />
                    <Route path="/osd" element={<OSD setTitle={setTitle}/>}/>
                </Routes>
            </BrowserRouter>
        </div>
    );
}