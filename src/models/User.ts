import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity("users")
class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  whatsapp_id: string;

  @Column()
  valorant_data: string;
}

export default User;
