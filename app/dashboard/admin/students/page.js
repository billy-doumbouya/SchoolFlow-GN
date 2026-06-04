"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { createStudentSchema } from "@/schemas";
import { useFetch, useApi, useDebounce, usePagination } from "@/hooks";
import { toast } from "sonner";
import {
  Button,
  Card,
  Badge,
  Avatar,
  Modal,
  Input,
  Select,
  Table,
  TableHead,
  Th,
  TableBody,
  Tr,
  Td,
  EmptyState,
  Pagination,
  LoadingPage,
  PageHeader,
  SearchInput,
  ConfirmModal,
} from "@/components/ui";

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const debouncedSearch = useDebounce(search, 300);
  const { page, setPage, queryString } = usePagination();

  const url = `/students?${queryString}${debouncedSearch ? `&search=${debouncedSearch}` : ""}`;
  const { data, loading, refetch } = useFetch(url, [page, debouncedSearch]);
  const { post, put, del, loading: saving } = useApi();

  const students = data?.data ?? [];
  const pagination = data?.pagination ?? null;

  async function handleDelete(id) {
    try {
      await del(`/students/${id}`);
      toast.success("Élève désactivé avec succès");
      setDeleting(null);
      refetch();
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function handleSave(data) {
    try {
      if (editing) {
        await put(`/students/${editing.id}`, data);
        toast.success("Élève mis à jour");
      } else {
        await post("/students", data);
        toast.success("Élève créé — identifiants envoyés par WhatsApp");
      }
      setShowForm(false);
      setEditing(null);
      refetch();
    } catch (e) {
      toast.error(e.message);
    }
  }

  return (
    <div style={{ padding: "32px", fontFamily: "DM Sans, sans-serif" }}>
      <PageHeader
        title="Élèves"
        subtitle={`${pagination?.total ?? 0} élève${(pagination?.total ?? 0) !== 1 ? "s" : ""} inscrits`}
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            <svg
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Nouvel élève
          </Button>
        }
      />

      <div style={{ marginBottom: "16px" }}>
        <SearchInput
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Rechercher un élève..."
        />
      </div>

      <Card>
        {loading ? (
          <LoadingPage />
        ) : students.length === 0 ? (
          <EmptyState
            icon="🎓"
            title="Aucun élève trouvé"
            description={
              search ? "Essayez un autre terme" : "Ajoutez votre premier élève"
            }
            action={
              !search && (
                <Button onClick={() => setShowForm(true)}>
                  Ajouter un élève
                </Button>
              )
            }
          />
        ) : (
          <>
            <Table>
              <TableHead>
                <Th>Élève</Th>
                <Th>Code</Th>
                <Th>Classe</Th>
                <Th>Parent</Th>
                <Th>Statut</Th>
                <Th></Th>
              </TableHead>
              <TableBody>
                {students.map((s) => (
                  <Tr key={s.id}>
                    <Td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <Avatar
                          name={`${s.user.firstName} ${s.user.lastName}`}
                          size="sm"
                        />
                        <div>
                          <p
                            style={{
                              margin: 0,
                              fontWeight: "600",
                              color: "white",
                              fontSize: "13px",
                            }}
                          >
                            {s.user.firstName} {s.user.lastName}
                          </p>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "11px",
                              color: "#475569",
                            }}
                          >
                            {s.user.email}
                          </p>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontSize: "12px",
                          color: "#64748b",
                          background: "rgba(255,255,255,0.04)",
                          padding: "2px 8px",
                          borderRadius: "6px",
                        }}
                      >
                        {s.studentCode}
                      </span>
                    </Td>
                    <Td>
                      {s.enrollments?.[0]?.class ? (
                        <Badge variant="info">
                          {s.enrollments[0].class.name}
                        </Badge>
                      ) : (
                        <span style={{ color: "#334155", fontSize: "12px" }}>
                          —
                        </span>
                      )}
                    </Td>
                    <Td>
                      {s.parentName ? (
                        <div>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "12px",
                              color: "#e2e8f0",
                            }}
                          >
                            {s.parentName}
                          </p>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "11px",
                              color: "#475569",
                            }}
                          >
                            {s.parentPhone}
                          </p>
                        </div>
                      ) : (
                        <span style={{ color: "#334155", fontSize: "12px" }}>
                          —
                        </span>
                      )}
                    </Td>
                    <Td>
                      <Badge variant={s.isActive ? "success" : "danger"}>
                        {s.isActive ? "Actif" : "Inactif"}
                      </Badge>
                    </Td>
                    <Td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          onClick={() => {
                            setEditing(s);
                            setShowForm(true);
                          }}
                          style={{
                            fontSize: "12px",
                            color: "#93c5fd",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: "600",
                            fontFamily: "DM Sans, sans-serif",
                          }}
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => setDeleting(s)}
                          style={{
                            fontSize: "12px",
                            color: "#ef4444",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontFamily: "DM Sans, sans-serif",
                          }}
                        >
                          Retirer
                        </button>
                      </div>
                    </Td>
                  </Tr>
                ))}
              </TableBody>
            </Table>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </Card>

      {showForm && (
        <StudentFormModal
          student={editing}
          saving={saving}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSave={handleSave}
        />
      )}

      <ConfirmModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => handleDelete(deleting?.id)}
        loading={saving}
        title="Retirer cet élève ?"
        message={`${deleting?.user?.firstName} ${deleting?.user?.lastName} sera désactivé et ne pourra plus se connecter. Les données sont conservées.`}
        confirmLabel="Oui, retirer"
      />
    </div>
  );
}

function StudentFormModal({ student, saving, onClose, onSave }) {
  const isEdit = !!student;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(createStudentSchema),
    defaultValues: student
      ? {
          firstName: student.user.firstName,
          lastName: student.user.lastName,
          email: student.user.email,
          gender: student.gender,
          address: student.address,
          parentName: student.parentName,
          parentPhone: student.parentPhone,
          parentEmail: student.parentEmail,
        }
      : {},
  });

  return (
    <Modal
      open
      title={isEdit ? "Modifier l'élève" : "Nouvel élève"}
      onClose={onClose}
      size="lg"
    >
      <form
        onSubmit={handleSubmit(onSave)}
        style={{ display: "flex", flexDirection: "column", gap: "16px" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "14px",
          }}
        >
          <Input
            label="Prénom"
            required
            error={errors.firstName?.message}
            {...register("firstName")}
            placeholder="Alpha"
          />
          <Input
            label="Nom"
            required
            error={errors.lastName?.message}
            {...register("lastName")}
            placeholder="Diallo"
          />
        </div>
        <Input
          label="Email"
          required
          type="email"
          error={errors.email?.message}
          {...register("email")}
          placeholder="alpha@ecole.gn"
        />
        {!isEdit && (
          <Input
            label="Mot de passe (optionnel)"
            type="password"
            error={errors.password?.message}
            {...register("password")}
            placeholder="Généré automatiquement si vide"
          />
        )}
        <Input
          label="Téléphone WhatsApp"
          error={errors.phone?.message}
          {...register("phone")}
          placeholder="+224 6XX XXX XXX"
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "14px",
          }}
        >
          <Input
            label="Date de naissance"
            type="date"
            error={errors.dateOfBirth?.message}
            {...register("dateOfBirth")}
          />
          <Select
            label="Genre"
            error={errors.gender?.message}
            {...register("gender")}
          >
            <option value="">Sélectionner</option>
            <option value="MALE">Masculin</option>
            <option value="FEMALE">Féminin</option>
            <option value="OTHER">Autre</option>
          </Select>
        </div>
        <Input
          label="Adresse"
          error={errors.address?.message}
          {...register("address")}
          placeholder="Conakry, Guinée"
        />
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "12px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "11px",
              fontWeight: "700",
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            👨‍👩‍👧 Parent / Tuteur
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px",
            }}
          >
            <Input
              label="Nom du parent"
              error={errors.parentName?.message}
              {...register("parentName")}
              placeholder="Fatoumata Diallo"
            />
            <Input
              label="Téléphone WhatsApp"
              error={errors.parentPhone?.message}
              {...register("parentPhone")}
              placeholder="+224 6XX XXX XXX"
            />
          </div>
          <Input
            label="Email parent"
            type="email"
            error={errors.parentEmail?.message}
            {...register("parentEmail")}
            placeholder="parent@email.com"
          />
        </div>
        <div style={{ display: "flex", gap: "10px", paddingTop: "4px" }}>
          <Button
            variant="secondary"
            type="button"
            onClick={onClose}
            style={{ flex: 1 }}
          >
            Annuler
          </Button>
          <Button type="submit" loading={saving} style={{ flex: 1 }}>
            {isEdit ? "Enregistrer" : "Créer l'élève"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
