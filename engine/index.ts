import {
    mesh, point, triangle,
    pointTimeMatrix, 
    translateTriangle, 
    rotateTriangle, 
    getNormal, 
    dotProduct, 
    normalize, 
    objLoader,
    meshCube,
    buildProjectionMatrix,
    sortTriangle,
    getAvgZ
} from "./utils"


export default class Engin {
    private ctx:CanvasRenderingContext2D
    private mesh:mesh
    private animationIndex:null|number
    private near:number
    private far:number
    private fov:number
    private aspectRatio:number
    private camera:point
    private lightDir:point
    private projectionMatrix:number[][]

    constructor(ctx:CanvasRenderingContext2D){
        this.ctx = ctx
        this.mesh = meshCube()
        this.animationIndex=null
        this.near = 1
        this.far = 1000
        this.fov = 90
        this.aspectRatio = ctx.canvas.height / ctx.canvas.width
        this.projectionMatrix = buildProjectionMatrix(this.aspectRatio, this.near, this.far, this.fov)
        this.camera = {x:0, y:0, z:0}
        this.lightDir = {x:0, y:0, z:-1}
        objLoader("teapot.obj").then((result)=>{
            if(result != null)
                this.mesh = result
        })
    }
    projectTriangle(tri:triangle):triangle{
        const projTri:triangle = {points:[
            pointTimeMatrix(tri.points[0],this.projectionMatrix),
            pointTimeMatrix(tri.points[1],this.projectionMatrix),
            pointTimeMatrix(tri.points[2],this.projectionMatrix)
        ]}
        return projTri
    }
    update(timestamp:number){
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        let buffer:triangle[] =[] 
        this.mesh.tris.forEach(triangle => {
            const moved = translateTriangle(triangle,0,-1,0)
            const rotaTri = rotateTriangle(moved,timestamp/3000,timestamp/1000,timestamp/2000)
            const tranTri = translateTriangle(rotaTri,0,0,7)
            const triNormal = getNormal(tranTri)
            const lookAt = {x:tranTri.points[0].x-this.camera.x, y:tranTri.points[0].y-this.camera.y, z: tranTri.points[0].z-this.camera.z}

            if(dotProduct(lookAt,triNormal) < 0){
                const projTri = this.projectTriangle(tranTri)
                const viewTri = this.scaleToView(projTri)
                const shading = dotProduct(normalize(this.lightDir), triNormal)
                viewTri.shade = shading
                buffer.push(viewTri)
            }
        })
        sortTriangle(buffer)
        buffer.forEach(tri =>{
            this.drawTriangle(tri, false)
        })
        this.animationIndex = requestAnimationFrame(this.update.bind(this))
    }
    private scaleToView(tri:triangle):triangle{
        return {points:[{
            x:(tri.points[0].x+1)*0.5*this.ctx.canvas.width, y:(tri.points[0].y+1)*0.5*this.ctx.canvas.height, z:tri.points[0].z},
            {x:(tri.points[1].x+1)*0.5*this.ctx.canvas.width, y:(tri.points[1].y+1)*0.5*this.ctx.canvas.height, z:tri.points[0].z},
            {x:(tri.points[2].x+1)*0.5*this.ctx.canvas.width, y:(tri.points[2].y+1)*0.5*this.ctx.canvas.height, z:tri.points[0].z}]}
    }
    cancelAnimation(){
        if(this.animationIndex)
            cancelAnimationFrame(this.animationIndex)
    }
    private drawTriangle(tri:triangle, stroke:boolean){
        this.ctx.beginPath()
        this.ctx.moveTo(tri.points[0].x, tri.points[0].y)
        this.ctx.lineTo(tri.points[1].x, tri.points[1].y)
        this.ctx.lineTo(tri.points[2].x, tri.points[2].y)
        this.ctx.closePath()
        this.ctx.lineWidth = 1
        if(tri.shade){
            this.ctx.fillStyle = `rgb(${tri.shade*225},${tri.shade*225},${tri.shade*225})`
            this.ctx.strokeStyle = `rgb(${tri.shade*225},${tri.shade*225},${tri.shade*225})`
        }
        if(stroke)
            this.ctx.strokeStyle = `rgb(10,10,10)`
        this.ctx.stroke()
        this.ctx.fill()
    }
}