// =====================================================================
// 02g TOWN LAYOUT: Ciudad Insurgentes on its real street skeleton
// Origin = the Glorieta, where Highway 1 turns east for Loreto. Blvd. Benito Juarez = the z axis.
// Street lines were fitted to map positions of about thirty named streets: blocks are long rectangles
// (about 160 m x 92 m in the real town, 96 x 60 here), larger south of the highway.
// =====================================================================
const AX=[-352,-256,-160,-64,0,64,160,256,352,448,544,640,736,832,928];
const SZN=[];for(let n=0;n<=15;n++)SZN.push(-60*n);
const SZS=[54,134,214,294,374,454,534,614,694,774];
const BOUND={x0:-372,x1:1048,z0:-930,z1:800};
const NAME_Z={'-60':'FRANCISCO I. MADERO','-120':'PADRE EUSEBIO KINO','-180':'MARIANO ABASOLO','-240':'H. GALEANA','-300':'BELISARIO DOMÍNGUEZ','-360':'MIGUEL HIDALGO',
  '-420':'SERAPIO RENDÓN','-480':'PÍPILA','-540':'J. ORTIZ DE DOMÍNGUEZ','-600':'IGNACIO ALLENDE','-720':'VICENTE GUERRERO','-780':'M. M. DIÉGUEZ','-840':'V. GÓMEZ FARÍAS','-900':'EMILIANO ZAPATA',
  '294':'IGNACIO RAMÍREZ','374':'ÁLVARO OBREGÓN','454':'MELCHOR OCAMPO','534':'NIÑOS HÉROES','614':'GUADALUPE VICTORIA'};
const NAME_X={'0':'BLVD. BENITO JUÁREZ','160':'AV. 20 DE NOVIEMBRE','256':'A. LÓPEZ MATEOS','352':'5 DE MAYO','448':'S. LERDO DE TEJADA','-160':'AV. MORELOS','832':'JUAN ÁLVAREZ'};
// names are only shown where an address or a street position supports them
const nameX=(x,z)=>x===0?NAME_X[0]:x===-256?(z<=0?'FCO. JAVIER MINA':'16 DE SEPTIEMBRE'):z<=0?NAME_X[x]:null;
const nameZ=(x,z)=>z===0?(x>0?'CARR. A LORETO':null):(z===-900&&x<448)?null:(z>0&&x>0)?null:NAME_Z[z];
const hwX=x=>x===0?10.5:6;

flat(M.sand,-2800,-2800,2800,2800,0,12);
// highways: the boulevard (Highway 1 from the south, the road to La Purisima to the north) and the road to Loreto
flat(M.asphalt,-10.5,-960,10.5,1900,.03,10);flat(M.asphalt,-5,-1900,5,-960,.03,10);flat(M.asphalt,10.5,-5.5,1900,5.5,.03,10);
for(let s=-956;s<1400;s+=14){flat(M.lineW,6.38,s,6.62,s+6,.05,1);flat(M.lineW,-6.62,s,-6.38,s+6,.05,1);}
for(let s=-1890;s<-966;s+=14)flat(M.line,-.12,s,.12,s+6,.05,1);
for(let s=24;s<1890;s+=14)flat(M.line,s,-.12,s+6,.12,.05,1);
flat(M.lineW,10.6,-5.3,1890,-5.1,.05,1);flat(M.lineW,10.6,5.1,1890,5.3,.05,1);
// tree-lined median of the boulevard, broken at every cross street
{const cuts=SZS.slice().reverse().concat(SZN);
 for(let k=0;k<cuts.length-1;k++){const a=cuts[k+1]+7.5,b=cuts[k]-7.5;pad(0,(a+b)/2,5,b-a,M.pad,true);
   for(let z=a+4,n=k;z<b-3;z+=11.5,n++){if(Math.abs(z)<24)continue;if(n%2===0)palms.push([0,z]);else lamps.push([0,z,0,0]);}}
 pad(0,1340,5,1117,M.sand,true);}
// paved streets in the centre; every other street is graded dirt
const PAVED_X={'160':[-726,-5.5],'256':[-726,-534]},PAVED_Z={'-480':[10.5,166],'-600':[58,358],'-660':[154,262]};
const southCol=x=>x>=-352&&x<=352;
// an avenue segment; east of the boulevard it is interrupted by the Loreto highway
function avenue(x,a,b,mat,y){if(x>0&&a<-5.5&&b>5.5){flat(mat,x-6,a,x+6,-5.5,y,mat===M.asphalt?10:12);flat(mat,x-6,5.5,x+6,b,y,mat===M.asphalt?10:12);}else flat(mat,x-6,a,x+6,b,y,mat===M.asphalt?10:12);}
for(const x of AX){if(x===0)continue;const z0=-906,z1=southCol(x)?780:(x>0?-5.5:6),pv=PAVED_X[x];
  if(pv){avenue(x,z0,pv[0],M.dirt,.02);avenue(x,pv[0],pv[1],M.asphalt,.025);if(z1>pv[1]+1)avenue(x,pv[1]>-6?5.5:pv[1],z1,M.dirt,.02);}
  else avenue(x,z0,z1,M.dirt,.02);}
function crossStreet(z,xa,xb){for(let i=0;i<AX.length-1;i++){const a=AX[i]+hwX(AX[i]),b=AX[i+1]-hwX(AX[i+1]);if(b<=xa||a>=xb)continue;const pv=PAVED_Z[z];
    if(pv&&a>=pv[0]-1&&b<=pv[1]+1)flat(M.asphalt,a,z-6,b,z+6,.025,10);else flat(M.dirtX,a,z-6,b,z+6,.02,12);}}
for(const z of SZN)crossStreet(z,z===0?-360:-360,z===0?-10:936);
for(const z of SZS)crossStreet(z,-360,360);
// farm fields of the Valle de Santo Domingo (aligned with the highway, as the real parcels are)
const FIELDS=[[-1000,-900,-392,-480],[-1000,-460,-392,-40],[-1000,-20,-392,380],[-1000,400,-392,820],[-372,832,-24,1200],[24,832,380,1200],[-1000,840,-392,1200],
  [400,40,1010,410],[400,430,1010,820],[1062,-820,1500,-420],[962,-400,1500,-30],[1030,40,1500,410],[-372,-1300,-24,-962],[24,-1300,460,-962],[480,-1300,1100,-962],[-1000,-1300,-392,-920]];
FIELDS.forEach((f,k)=>flat(k%3===2?M.fallow:M.field,f[0],f[1],f[2],f[3],.02,6));

// ---------- blocks
const BLOCKS=[],kept={};
{const rows=[];for(let n=0;n<15;n++)rows.push([-60*n-54,-60*n-6]);rows.push([6,48]);for(let k=0;k<SZS.length-1;k++)rows.push([SZS[k]+6,SZS[k+1]-6]);
 for(let i=0;i<AX.length-1;i++){const x0=AX[i]+hwX(AX[i]),x1=AX[i+1]-hwX(AX[i+1]);for(const r of rows)BLOCKS.push({cx:(x0+x1)/2,cz:(r[0]+r[1])/2,w:x1-x0,d:r[1]-r[0]});}}
const bkey=B=>Math.round(B.cx)+','+Math.round(B.cz);
// how far a block is from the built-up core (0 = centre, 1 = edge of town)
function sup(cx,cz){const q=(a,b)=>a*a*a*a+b*b*b*b;
  if(cz>0)return cx>360?9:q((cx+10)/350,(cz-330)/470);
  let v=q((cx-70)/420,(cz+440)/500);if(cx>450)v=Math.min(v,q((cx-690)/250,(cz+450)/465));return v;}
// shops line the boulevard, the highway and the streets round the plaza
function commerce(B){const c=[.04,.04,.04,.04];
  if(Math.abs(B.cx)<40)c[B.cx>0?2:3]=.86;
  if(B.cz===-30&&B.cx>40){c[1]=.6;}if(B.cz===27&&B.cx>40)c[0]=.5;
  if(Math.abs(B.cx-208)<100&&Math.abs(B.cz+630)<70){c[0]=c[1]=c[2]=c[3]=.4;}
  if(Math.abs(B.cx-112)<1&&B.cz<0&&B.cz>-720)c[3]=.3;if(Math.abs(B.cx-208)<1&&B.cz<0&&B.cz>-600)c[2]=.3;return c;}
function plainBlock(B,v,skip){pad(B.cx,B.cz,B.w,B.d);blockHouses(B,Math.abs(B.cx)<40?.05:v<.3?.08:v<.6?.18:v<.85?.34:.52,skip,commerce(B),v>.6,Math.abs(B.cx)<40);
  if(rnd()<.5)palms.push([B.cx+rr(-B.w/4,B.w/4),B.cz+rr(-4,4)]);}
