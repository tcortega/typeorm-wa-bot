import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("users")
class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  whatsapp_id: string;

  @Column()
  valorant_data: string;
}

export default User;
