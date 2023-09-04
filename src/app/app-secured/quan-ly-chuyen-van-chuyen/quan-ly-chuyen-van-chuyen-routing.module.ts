import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { QuanLyChuyenXeComponent } from './quan-ly-chuyen-xe/quan-ly-chuyen-xe.component';
import { Constant } from '../../infrastructure/constant';
import { DongSealComponent } from './dong-seal/dong-seal.component';
import { MoSealComponent } from './mo-seal/mo-seal.component';
import { TraCuuXeComponent } from './tra-cuu-xe/tra-cuu-xe.component';

const routes: Routes = [
  { path: Constant.pages.quanLyChuyen_VanChuyen.children.quanLyChuyenXe.alias, component: QuanLyChuyenXeComponent },
  { path: Constant.pages.quanLyChuyen_VanChuyen.children.dongSeal.alias, component: DongSealComponent },
  { path: Constant.pages.quanLyChuyen_VanChuyen.children.moSeal.alias, component: MoSealComponent },
  { path: Constant.pages.quanLyChuyen_VanChuyen.children.traCuuXe.alias, component: TraCuuXeComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuanLyChuyenVanChuyenRoutingModule { }
