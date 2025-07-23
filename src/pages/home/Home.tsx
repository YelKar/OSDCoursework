import styles from './Home.module.css';
import {Page} from "../../types";
import {Link} from "react-router-dom";
import {useEffect} from "react";


export default function Home({setTitle}: Page){
    useEffect(() => {
        setTitle('Главная страница');
    }, []);
    return (
        <div className={styles.mainMenu}>
            <Link to={'/osd'} className={`${styles.button} button`}>OSD</Link>
            <Link to={'/tree'} className={`${styles.button} button`}>Дерево</Link>
        </div>
    )
}