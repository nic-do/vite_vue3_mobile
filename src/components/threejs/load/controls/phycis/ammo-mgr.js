import {Mgr} from "@/components/threejs/load/controls/phycis/mgr";
export class AmmoMgr extends Mgr{
    dispose() {
        // this.Cannon = null
        // this.worldCannon = null
        // this.cannonDebugger = null
        this.Ammo =null
        this.worldAmmo=null
    }
    constructor(com) {
        super(com);
        // this.Cannon = null
        // this.worldCannon = null
        // this.cannonDebugger = null
        this.mgrType='ammo'
        this.Ammo =null
        this.worldAmmo=null
    }
    async useMgr() {
        super.useMgr()
        if (!this.worldAmmo) {
            let res = await this.com.getCollisionMgr('ammo')
            if (res != undefined) {
                let Ammo = new res.default()
                const initPhysics = (Ammo) => {
                    this.Ammo = Ammo
                    // Physics configuration
                    const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration()
                    const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration)
                    const broadphase = new Ammo.btDbvtBroadphase()
                    const solver = new Ammo.btSequentialImpulseConstraintSolver()
                    const gravityConstant = 7.8
                    this.worldAmmo = {
                        gravityConstant: gravityConstant,
                        collisionConfiguration: collisionConfiguration,
                        dispatcher: dispatcher,
                        broadphase: broadphase,
                        solver: solver,
                        physicsWorld: new Ammo.btDiscreteDynamicsWorld(
                            dispatcher,
                            broadphase,
                            solver,
                            collisionConfiguration
                        ),
                        transformAux1: new Ammo.btTransform(),
                        tempBtVec3_1: new Ammo.btVector3(0, 0, 0)
                    }
                    this.worldAmmo.physicsWorld.setGravity(new Ammo.btVector3(0, -gravityConstant, 0))
                }
                Ammo().then(function (AmmoLib) {
                    if (AmmoLib != undefined) {
                        initPhysics(AmmoLib)
                    }
                })
            }
        }
    }
    update(delatime,extra) {
        super.update(delatime,extra)
    }
}