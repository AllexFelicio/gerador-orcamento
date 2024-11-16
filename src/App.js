import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Grid,
} from "@mui/material";
import jsPDF from "jspdf";
import "jspdf-autotable";

function App() {
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    name: "",
    quantity: "",
    measure: "m²", // Unidade padrão
    value: "",
  });
  const [logo, setLogo] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem({ ...currentItem, [name]: value });
  };

  const handleMeasureChange = (e) => {
    setCurrentItem({ ...currentItem, measure: e.target.value });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      setLogo(reader.result);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const addItem = () => {
    if (currentItem.name && currentItem.value) {
      // Se a quantidade for "-", considera o valor unitário como total
      const total = currentItem.quantity === "-" ? currentItem.value : parseFloat(currentItem.value) * parseFloat(currentItem.quantity);

      setItems([
        ...items,
        { ...currentItem, total: total, quantity: currentItem.quantity === "-" ? "-" : currentItem.quantity },
      ]);
      setCurrentItem({ name: "", quantity: "", measure: "m²", value: "" });
    }
  };

  const deleteItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items
      .reduce((total, item) => total + (item.quantity === "-" ? parseFloat(item.value) : parseFloat(item.value) * parseFloat(item.quantity)), 0)
      .toFixed(2);
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    // Se tiver logo, adiciona no PDF
    if (logo) {
      const imgWidth = 60;
      const imgHeight = 30;
      const pageWidth = doc.internal.pageSize.getWidth();
      const xPosition = (pageWidth - imgWidth) / 2;
      doc.addImage(logo, "PNG", xPosition, 10, imgWidth, imgHeight);
    }

    doc.text("Orçamento", 10, logo ? 50 : 30);

    doc.autoTable({
      head: [["Item", "Quantidade", "Valor Unitário (R$)", "Total (R$)"]],
      body: items.map((item) => [
        item.name,
        item.quantity === "-" ? "N/A" : `${item.quantity} ${item.measure}`,
        item.quantity === "-" ? "-" : `R$ ${parseFloat(item.value).toFixed(2)}`,
        item.quantity === "-" ? `R$ ${item.value}` : `R$ ${(parseFloat(item.value) * parseFloat(item.quantity)).toFixed(2)}`,
      ]),
      startY: logo ? 60 : 40,
      theme: "grid",
      headStyles: {
        fillColor: [0, 51, 102],
        textColor: [255, 255, 255],
        fontSize: 12,
        fontStyle: "bold",
      },
      styles: {
        fontSize: 10,
        cellPadding: 5,
        lineWidth: 0.5,
      },
      margin: { top: 30 },
    });

    doc.text(`Total: R$ ${calculateTotal()}`, 10, doc.lastAutoTable.finalY + 10);
    doc.save("orcamento.pdf");
  };

  return (
    <Box sx={{ padding: 4, fontFamily: "Roboto", display: "flex", justifyContent: "center" }}>
      <Box sx={{ width: "100%", maxWidth: "900px" }}>
        <Typography variant="h4" gutterBottom textAlign="center">
          Gerador de Orçamento
        </Typography>

        <Box sx={{ marginBottom: 3 }}>
          <Typography variant="subtitle1">Carregar Logo (opcional):</Typography>
          <input type="file" accept="image/*" onChange={handleLogoUpload} />
        </Box>

        <Grid container spacing={2} sx={{ marginBottom: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Item"
              name="name"
              variant="outlined"
              fullWidth
              value={currentItem.name}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label={`Quantidade (${currentItem.measure})`}
              name="quantity"
              variant="outlined"
              fullWidth
              value={currentItem.quantity}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl variant="outlined" fullWidth>
              <InputLabel>Medida</InputLabel>
              <Select
                value={currentItem.measure}
                onChange={handleMeasureChange}
                label="Medida"
              >
                <MenuItem value="unidade">Unidade</MenuItem>
                <MenuItem value="m²">m²</MenuItem>
                <MenuItem value="m³">m³</MenuItem>
                <MenuItem value="kg">kg</MenuItem>
                <MenuItem value="litros">Litros</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Valor Unitário (R$)"
              name="value"
              type="number"
              variant="outlined"
              fullWidth
              value={currentItem.value}
              onChange={handleChange}
            />
          </Grid>
        </Grid>

        <Box sx={{ textAlign: "center", marginBottom: 3 }}>
          <Button variant="contained" color="primary" onClick={addItem} sx={{ height: "56px" }}>
            Adicionar Item
          </Button>
        </Box>

        <TableContainer component={Paper} sx={{ marginTop: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell>Quantidade</TableCell>
                <TableCell>Valor Unitário (R$)</TableCell>
                <TableCell>Total (R$)</TableCell>
                <TableCell>Excluir</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.quantity === "-" ? "N/A" : `${item.quantity} ${item.measure}`}</TableCell>
                  <TableCell>{item.quantity === "-" ? "-" : `R$ ${parseFloat(item.value).toFixed(2)}`}</TableCell>
                  <TableCell>
                    {item.quantity === "-" ? `R$ ${item.value}` : `R$ ${(parseFloat(item.value) * parseFloat(item.quantity)).toFixed(2)}`}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => deleteItem(index)}
                    >
                      Excluir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {items.length > 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="right">
                    <strong>Total Geral:</strong>
                  </TableCell>
                  <TableCell>
                    <strong>R$ {calculateTotal()}</strong>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ marginTop: 3, textAlign: "center" }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={generatePDF}
            disabled={items.length === 0}
          >
            Gerar PDF
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default App;
