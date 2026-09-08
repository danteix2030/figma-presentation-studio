import React from 'react';import {createRoot} from 'react-dom/client';import {Studio} from './Studio';import './style.css';
class Boundary extends React.Component<React.PropsWithChildren, {error:boolean}>{state={error:false};static getDerivedStateFromError(){return{error:true};}render(){return this.state.error?<div className='notice'>O editor encontrou um erro. Feche e reabra o plugin. As configurações salvas continuam no Figma.</div>:this.props.children;}}
createRoot(document.getElementById('root')!).render(<Boundary><Studio/></Boundary>);
